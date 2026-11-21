// Lecture et écriture des personnages et de leur sauvegarde.
//
// Le jeu (client) manipule un seul gros objet, GameProgressState. Dans la
// base, il est rangé de façon « hybride » :
//
//   GameProgressState                  PostgreSQL
//   -----------------                  ----------
//   level, xp, hp, gold, zoneId   ->   colonnes de personnage (CHECK, clé étrangère vers zone)
//   inventory                     ->   table instance_objet (une ligne par objet possédé)
//   quests                        ->   table progression_quete (une ligne par quête commencée)
//   tout le reste (bestiaire,     ->   colonne JSONB personnage.progression
//   compétences, codex...)
//
// Ainsi les règles importantes sont vérifiées par la base (objet empilable,
// équipement, prérequis des quêtes...), et le détail qui change souvent côté
// jeu reste souple.
//
// Une sauvegarde se fait dans UNE transaction : si une seule règle est
// violée, rien n'est enregistré et l'ancienne sauvegarde reste intacte.
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import {
  classe,
  divinite,
  instanceObjet,
  objet,
  personnage,
  progressionQuete,
  zone,
  type ProgressionEtendue,
  type StatutQuete
} from '../db/schema.js';

// ---------------------------------------------------------------------
// Formats échangés avec le client (mêmes noms que GameProgressState)
// ---------------------------------------------------------------------

export type StatutQueteClient = 'locked' | 'available' | 'active' | 'ready' | 'completed';

export interface EmplacementInventaire {
  itemId: string;
  quantity: number;
  equipped?: boolean;
}

export interface QueteClient {
  status: StatutQueteClient;
  counts: Record<string, number>;
}

// Ce que le client envoie pour sauvegarder.
export interface Sauvegarde {
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  gold: number;
  zoneId: string;
  position?: { x: number; y: number };
  inventory: EmplacementInventaire[];
  quests: Record<string, QueteClient>;
  // Tout le reste (bestiaryKills, unlockedSkills...) va dans la colonne JSONB.
  progression: ProgressionEtendue;
}

// Correspondance des statuts de quête : client <-> base.
// « locked » et « available » = quête pas commencée = pas de ligne dans la base.
const STATUT_VERS_BASE: Partial<Record<StatutQueteClient, StatutQuete>> = {
  active: 'en_cours',
  ready: 'a_rendre',
  completed: 'terminee'
};
const STATUT_VERS_CLIENT: Record<StatutQuete, StatutQueteClient> = {
  en_cours: 'active',
  a_rendre: 'ready',
  terminee: 'completed',
  abandonnee: 'available'
};

// Erreur « prévue » : donnée refusée (code inconnu...), renvoyée au joueur en 400.
export class SauvegardeRefusee extends Error {}

// Champs de progression toujours présents dans la réponse, pour que le client
// n'ait jamais de tableau « undefined ».
const PROGRESSION_PAR_DEFAUT = {
  prologueSeen: false,
  collectedInteractables: [],
  activatedTrialSteles: [],
  unlockedCodex: [],
  defeatedBosses: [],
  bestiaryKills: {},
  discoveredZones: ['agora'],
  skillPoints: 0,
  unlockedSkills: {},
  zoneKillCounts: {}
};

// ---------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------

// Résumé des personnages d'un compte (écran de choix du héros).
export function listerPersonnages(compteId: number) {
  return db
    .select({
      id: personnage.id,
      heroName: personnage.nom,
      heroClass: classe.code,
      god: personnage.diviniteCode,
      level: personnage.niveau,
      zoneId: zone.code,
      savedAt: personnage.dateSauvegarde
    })
    .from(personnage)
    .innerJoin(classe, eq(classe.id, personnage.classeId))
    .innerJoin(zone, eq(zone.id, personnage.zoneId))
    .where(eq(personnage.compteId, compteId))
    .orderBy(asc(personnage.id));
}

// Sauvegarde complète d'un personnage, au format GameProgressState.
// Renvoie null si le personnage n'existe pas OU n'appartient pas à ce compte
// (on ne révèle pas l'existence des personnages des autres joueurs).
export async function lirePersonnage(compteId: number, personnageId: number) {
  const [p] = await db
    .select({
      id: personnage.id,
      nom: personnage.nom,
      classe: classe.code,
      divinite: personnage.diviniteCode,
      niveau: personnage.niveau,
      experience: personnage.experience,
      pv: personnage.pv,
      pvMax: personnage.pvMax,
      piecesOr: personnage.piecesOr,
      zone: zone.code,
      x: personnage.positionX,
      y: personnage.positionY,
      modeVue: personnage.modeVue,
      progression: personnage.progression,
      dateSauvegarde: personnage.dateSauvegarde
    })
    .from(personnage)
    .innerJoin(classe, eq(classe.id, personnage.classeId))
    .innerJoin(zone, eq(zone.id, personnage.zoneId))
    .where(and(eq(personnage.id, personnageId), eq(personnage.compteId, compteId)));
  if (!p) return null;

  const inventaire = await db
    .select({ itemId: objet.code, quantity: instanceObjet.quantite, equipped: instanceObjet.equipe })
    .from(instanceObjet)
    .innerJoin(objet, eq(objet.id, instanceObjet.objetId))
    .where(eq(instanceObjet.proprietaireId, personnageId))
    .orderBy(asc(instanceObjet.id));

  // Statut de TOUTES les quêtes : celles commencées viennent de progression_quete ;
  // pour les autres, la base calcule si elles sont disponibles (tous les
  // prérequis terminés) ou encore verrouillées.
  const quetes = await db.execute<{ id: string; statut: StatutQuete | null; compteurs: Record<string, number> | null; prerequis_ok: boolean }>(sql`
    SELECT q.id, pq.statut, pq.compteurs,
           NOT EXISTS (
               SELECT 1 FROM quete_prerequis qp
                WHERE qp.quete_id = q.id
                  AND NOT EXISTS (SELECT 1 FROM progression_quete fini
                                   WHERE fini.personnage_id = ${personnageId}
                                     AND fini.quete_id = qp.prerequis_id
                                     AND fini.statut = 'terminee')
           ) AS prerequis_ok
      FROM quete q
      LEFT JOIN progression_quete pq ON pq.quete_id = q.id AND pq.personnage_id = ${personnageId}
     ORDER BY q.id`);

  const quests: Record<string, QueteClient> = {};
  for (const q of quetes.rows) {
    quests[q.id] = {
      status: q.statut ? STATUT_VERS_CLIENT[q.statut] : q.prerequis_ok ? 'available' : 'locked',
      counts: q.compteurs ?? {}
    };
  }

  return {
    id: p.id,
    heroName: p.nom,
    heroClass: p.classe,
    god: p.divinite,
    level: p.niveau,
    xp: p.experience,
    hp: p.pv,
    maxHp: p.pvMax,
    gold: p.piecesOr,
    zoneId: p.zone,
    position: { x: p.x, y: p.y },
    viewMode: p.modeVue,
    ...PROGRESSION_PAR_DEFAUT,
    ...p.progression,
    inventory: inventaire,
    quests,
    savedAt: p.dateSauvegarde
  };
}

// ---------------------------------------------------------------------
// Création et suppression
// ---------------------------------------------------------------------

// Crée un personnage dans l'état de départ du jeu : zone « agora », 25 drachmes,
// l'arme de sa classe équipée et 3 potions d'ambroisie (comme createNewGameState).
// La base refuse : nom déjà pris, plus de 5 personnages, classe ou dieu inconnu.
export async function creerPersonnage(
  compteId: number,
  donnees: { heroName: string; heroClass: string; god: string }
): Promise<number> {
  return db.transaction(async (tx) => {
    const [c] = await tx.select().from(classe).where(eq(classe.code, donnees.heroClass));
    if (!c) throw new SauvegardeRefusee(`Classe inconnue : ${donnees.heroClass}`);
    const [d] = await tx.select({ code: divinite.code }).from(divinite).where(eq(divinite.code, donnees.god));
    if (!d) throw new SauvegardeRefusee(`Divinité inconnue : ${donnees.god}`);
    const [depart] = await tx.select({ id: zone.id }).from(zone).where(eq(zone.code, 'agora'));

    const [nouveau] = await tx
      .insert(personnage)
      .values({
        compteId,
        classeId: c.id,
        diviniteCode: d.code,
        zoneId: depart.id,
        nom: donnees.heroName,
        pv: c.pvBase,
        pvMax: c.pvBase,
        piecesOr: 25,
        progression: { prologueSeen: false, discoveredZones: ['agora'], skillPoints: 1 }
      })
      .returning({ id: personnage.id });

    const objets = await tx
      .select({ id: objet.id, code: objet.code })
      .from(objet)
      .where(inArray(objet.code, [c.armeDepartCode, 'potion_ambroisie']));
    const idDe = (code: string) => objets.find((o) => o.code === code)!.id;
    await tx.insert(instanceObjet).values([
      { objetId: idDe(c.armeDepartCode), proprietaireId: nouveau.id, quantite: 1, equipe: true },
      { objetId: idDe('potion_ambroisie'), proprietaireId: nouveau.id, quantite: 3 }
    ]);
    return nouveau.id;
  });
}

// Supprime un personnage (ses objets, quêtes, amitiés... partent avec lui : ON DELETE CASCADE).
// Renvoie son nom, ou null s'il n'existe pas ou n'appartient pas au compte.
export async function supprimerPersonnage(compteId: number, personnageId: number): Promise<string | null> {
  const [supprime] = await db
    .delete(personnage)
    .where(and(eq(personnage.id, personnageId), eq(personnage.compteId, compteId)))
    .returning({ nom: personnage.nom });
  return supprime?.nom ?? null;
}

// ---------------------------------------------------------------------
// Sauvegarde
// ---------------------------------------------------------------------

// Enregistre l'état complet envoyé par le jeu. Renvoie false si le personnage
// n'existe pas ou n'appartient pas au compte.
export async function sauvegarderPersonnage(
  compteId: number,
  personnageId: number,
  sauvegarde: Sauvegarde
): Promise<boolean> {
  return db.transaction(async (tx) => {
    // 1. Verrouiller le personnage : deux sauvegardes simultanées (deux onglets)
    //    ne peuvent pas se mélanger, la seconde attend la fin de la première.
    const verrou = await tx.execute(sql`
      SELECT id FROM personnage WHERE id = ${personnageId} AND compte_id = ${compteId} FOR UPDATE`);
    if (verrou.rows.length === 0) return false;

    // 2. Personnage : colonnes simples. Les CHECK de la base refusent par
    //    exemple des PV supérieurs aux PV max ou un or négatif.
    const [zoneActuelle] = await tx.select({ id: zone.id, modeVue: zone.modeVue }).from(zone).where(eq(zone.code, sauvegarde.zoneId));
    if (!zoneActuelle) throw new SauvegardeRefusee(`Zone inconnue : ${sauvegarde.zoneId}`);
    await tx
      .update(personnage)
      .set({
        niveau: sauvegarde.level,
        experience: sauvegarde.xp,
        pv: sauvegarde.hp,
        pvMax: sauvegarde.maxHp,
        piecesOr: sauvegarde.gold,
        zoneId: zoneActuelle.id,
        modeVue: zoneActuelle.modeVue,
        ...(sauvegarde.position ? { positionX: sauvegarde.position.x, positionY: sauvegarde.position.y } : {}),
        progression: sauvegarde.progression,
        dateSauvegarde: sql`now()`
      })
      .where(eq(personnage.id, personnageId));

    await sauvegarderInventaire(tx, personnageId, sauvegarde.inventory);
    await sauvegarderQuetes(tx, personnageId, sauvegarde.quests);
    return true;
  });
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Inventaire : on garde les lignes existantes quand c'est possible (même
// objet), on ajoute les nouvelles et on supprime celles qui ont disparu.
// Garder les mêmes lignes est important : un objet engagé dans un échange
// est référencé par son id (table ligne_echange).
async function sauvegarderInventaire(tx: Transaction, personnageId: number, inventaire: EmplacementInventaire[]) {
  const codes = [...new Set(inventaire.map((e) => e.itemId))];
  const objets = codes.length
    ? await tx.select({ id: objet.id, code: objet.code }).from(objet).where(inArray(objet.code, codes))
    : [];
  const idParCode = new Map(objets.map((o) => [o.code, o.id]));
  const inconnu = codes.find((code) => !idParCode.has(code));
  if (inconnu) throw new SauvegardeRefusee(`Objet inconnu : ${inconnu}`);

  // Tout déséquiper d'abord : sinon, en échangeant deux armes, la nouvelle
  // serait équipée pendant un instant en même temps que l'ancienne, et le
  // trigger « un seul objet par emplacement » refuserait.
  await tx.update(instanceObjet).set({ equipe: false }).where(eq(instanceObjet.proprietaireId, personnageId));

  const existantes = await tx
    .select({ id: instanceObjet.id, objetId: instanceObjet.objetId, quantite: instanceObjet.quantite })
    .from(instanceObjet)
    .where(eq(instanceObjet.proprietaireId, personnageId))
    .orderBy(asc(instanceObjet.id));
  const reutilisees = new Set<number>();

  for (const emplacement of inventaire) {
    const objetId = idParCode.get(emplacement.itemId)!;
    const equipe = emplacement.equipped === true;
    const ligne = existantes.find((l) => l.objetId === objetId && !reutilisees.has(l.id));
    if (ligne) {
      reutilisees.add(ligne.id);
      await tx
        .update(instanceObjet)
        .set({ quantite: emplacement.quantity, equipe })
        .where(eq(instanceObjet.id, ligne.id));
    } else {
      // Les triggers vérifient : objet empilable si quantité > 1, emplacement libre si équipé.
      await tx.insert(instanceObjet).values({ objetId, proprietaireId: personnageId, quantite: emplacement.quantity, equipe });
    }
  }

  const aSupprimer = existantes.filter((l) => !reutilisees.has(l.id)).map((l) => l.id);
  if (aSupprimer.length) {
    await tx.delete(instanceObjet).where(inArray(instanceObjet.id, aSupprimer));
  }
}

// Quêtes : une ligne par quête commencée. Les quêtes sont écrites dans l'ordre
// de la chaîne (prérequis d'abord), car le trigger verifier_debut_quete
// refuse une quête dont les prérequis ne sont pas terminés.
async function sauvegarderQuetes(tx: Transaction, personnageId: number, quetes: Record<string, QueteClient>) {
  const commencees = Object.entries(quetes).filter(([, q]) => STATUT_VERS_BASE[q.status]);
  const pasCommencees = Object.entries(quetes)
    .filter(([, q]) => !STATUT_VERS_BASE[q.status])
    .map(([id]) => id);

  // Une quête redevenue « disponible » côté jeu : on efface sa progression.
  if (pasCommencees.length) {
    await tx
      .delete(progressionQuete)
      .where(and(eq(progressionQuete.personnageId, personnageId), inArray(progressionQuete.queteId, pasCommencees)));
  }
  if (commencees.length === 0) return;

  // Profondeur de chaque quête dans la chaîne (requête récursive) :
  // 0 = sans prérequis, 1 = après une quête de profondeur 0, etc.
  const profondeurs = await tx.execute<{ id: string; profondeur: number }>(sql`
    WITH RECURSIVE chaine AS (
        SELECT q.id, 0 AS profondeur
          FROM quete q
         WHERE NOT EXISTS (SELECT 1 FROM quete_prerequis qp WHERE qp.quete_id = q.id)
        UNION ALL
        SELECT qp.quete_id, c.profondeur + 1
          FROM quete_prerequis qp
          JOIN chaine c ON c.id = qp.prerequis_id
    )
    SELECT id, max(profondeur)::int AS profondeur FROM chaine GROUP BY id`);
  const profondeur = new Map(profondeurs.rows.map((r) => [r.id, r.profondeur]));
  const inconnue = commencees.find(([id]) => !profondeur.has(id));
  if (inconnue) throw new SauvegardeRefusee(`Quête inconnue : ${inconnue[0]}`);
  commencees.sort(([a], [b]) => profondeur.get(a)! - profondeur.get(b)!);

  for (const [queteId, q] of commencees) {
    await tx
      .insert(progressionQuete)
      .values({ personnageId, queteId, statut: STATUT_VERS_BASE[q.status]!, compteurs: q.counts })
      .onConflictDoUpdate({
        target: [progressionQuete.personnageId, progressionQuete.queteId],
        set: { statut: sql`excluded.statut`, compteurs: sql`excluded.compteurs` }
      });
  }
}

