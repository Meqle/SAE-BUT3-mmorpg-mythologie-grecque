// API des personnages et de leur sauvegarde. Toutes les routes demandent
// d'être connecté (en-tête Authorization: Bearer <jeton>), et un joueur ne
// voit et ne modifie QUE ses propres personnages.
//
//   GET    /api/characters            -> 200 { personnages: [{ id, heroName, heroClass, god, level, zoneId, savedAt }] }
//   POST   /api/characters            { heroName, heroClass, god } -> 201 { personnage: <sauvegarde complète> }
//   GET    /api/characters/:id        -> 200 { personnage: <sauvegarde complète, format GameProgressState> }
//   PUT    /api/characters/:id/save   <GameProgressState + maxHp> -> 200 { savedAt }
//   DELETE /api/characters/:id        -> 204
//
// Codes d'erreur : 400 donnée refusée (avec le message de la règle violée),
// 401 non connecté, 404 personnage introuvable, 409 conflit (nom déjà pris,
// objet engagé dans un échange...).
import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { asynchrone, erreurPostgres, exigerConnexion } from '../auth/routes.js';
import { adresseClient, journaliser } from '../journal/journal.js';
import {
  creerPersonnage,
  lirePersonnage,
  listerPersonnages,
  sauvegarderPersonnage,
  SauvegardeRefusee,
  supprimerPersonnage
} from './sauvegarde.js';

// --- Validation des données reçues -------------------------------------
// Zod vérifie la FORME (types, bornes, tailles). Les règles du jeu (codes
// existants, équipement, prérequis...) sont vérifiées par la base.

const code = z.string().regex(/^[a-z0-9_]{1,60}$/, 'Identifiant invalide.');
const entier = (min: number, max: number) => z.number().int().min(min).max(max);

const schemaCreation = z.object({
  heroName: z
    .string()
    .trim()
    .regex(/^[A-Za-zÀ-ÿ0-9_ -]{3,20}$/, 'Le nom du héros doit faire 3 à 20 caractères : lettres, chiffres, espace, _ ou -.'),
  heroClass: z.enum(['GUERRIER', 'ARCHER', 'MAGE', 'ASSASSIN']),
  god: z.enum(['ZEUS', 'POSEIDON', 'HADES', 'ATHENA', 'ARES', 'APOLLO'])
});

// Champs rangés dans des colonnes ou des tables ; tous les AUTRES champs
// envoyés par le jeu (bestiaryKills, unlockedSkills...) vont dans le JSONB.
const schemaSauvegarde = z
  .object({
    level: entier(1, 100),
    xp: entier(0, 100_000_000),
    hp: entier(0, 1_000_000),
    maxHp: entier(1, 1_000_000),
    gold: entier(0, 1_000_000_000),
    zoneId: code,
    position: z.object({ x: z.number().finite(), y: z.number().finite() }).optional(),
    inventory: z
      .array(z.object({ itemId: code, quantity: entier(1, 9999), equipped: z.boolean().optional() }))
      .max(300, 'Inventaire trop grand.'),
    quests: z
      .record(
        code,
        z.object({
          status: z.enum(['locked', 'available', 'active', 'ready', 'completed']),
          counts: z.record(z.string().max(60), entier(0, 1_000_000))
        })
      )
      .refine((q) => Object.keys(q).length <= 200, 'Trop de quêtes.')
  })
  .passthrough();

// Champs du client qui ne sont pas de la progression (déjà stockés ailleurs).
const CHAMPS_HORS_PROGRESSION = new Set([
  'level', 'xp', 'hp', 'maxHp', 'gold', 'zoneId', 'position', 'inventory', 'quests',
  'id', 'heroName', 'heroClass', 'god', 'viewMode', 'savedAt'
]);

const schemaId = z.coerce.number().int().positive().max(2_147_483_647);

function lireId(req: Request, res: Response): number | null {
  const resultat = schemaId.safeParse(req.params.id);
  if (!resultat.success) {
    res.status(404).json({ erreur: 'Personnage introuvable.' });
    return null;
  }
  return resultat.data;
}

const introuvable = (res: Response) => res.status(404).json({ erreur: 'Personnage introuvable.' });

// Répond par une erreur. Si c'est une SAUVEGARDE refusée, on la note dans le
// journal : des refus répétés sur un compte = bug du jeu ou tentative de triche.
function refuser(req: Request, res: Response, code: number, message: string): void {
  // (req.params n'est pas rempli dans le gestionnaire d'erreurs : on relit l'id dans le chemin.)
  const sauvegarde = req.method === 'PUT' ? /^\/(\d+)\/save$/.exec(req.path) : null;
  if (sauvegarde) {
    journaliser({
      type: 'sauvegarde_refusee',
      compteId: res.locals.compteId as number,
      adresseIp: adresseClient(req),
      details: { personnage_id: Number(sauvegarde[1]), motif: message.slice(0, 200) }
    });
  }
  res.status(code).json({ erreur: message });
}

// --- Routes ---------------------------------------------------------------

export const routeurPersonnages = Router();
routeurPersonnages.use(exigerConnexion);

routeurPersonnages.get(
  '/',
  asynchrone(async (_req, res) => {
    res.json({ personnages: await listerPersonnages(res.locals.compteId as number) });
  })
);

routeurPersonnages.post(
  '/',
  asynchrone(async (req, res) => {
    const resultat = schemaCreation.safeParse(req.body);
    if (!resultat.success) {
      res.status(400).json({ erreur: resultat.error.issues[0]?.message ?? 'Données invalides.' });
      return;
    }
    const compteId = res.locals.compteId as number;
    const id = await creerPersonnage(compteId, resultat.data);
    journaliser({
      type: 'creation_personnage',
      compteId,
      adresseIp: adresseClient(req),
      details: { personnage_id: id, nom: resultat.data.heroName, classe: resultat.data.heroClass, divinite: resultat.data.god }
    });
    res.status(201).json({ personnage: await lirePersonnage(compteId, id) });
  })
);

routeurPersonnages.get(
  '/:id',
  asynchrone(async (req, res) => {
    const id = lireId(req, res);
    if (id === null) return;
    const perso = await lirePersonnage(res.locals.compteId as number, id);
    if (!perso) {
      introuvable(res);
      return;
    }
    res.json({ personnage: perso });
  })
);

routeurPersonnages.put(
  '/:id/save',
  asynchrone(async (req, res) => {
    const id = lireId(req, res);
    if (id === null) return;
    const resultat = schemaSauvegarde.safeParse(req.body);
    if (!resultat.success) {
      const probleme = resultat.error.issues[0];
      refuser(req, res, 400, `Sauvegarde invalide (${probleme?.path.join('.') || 'corps'}) : ${probleme?.message}`);
      return;
    }
    const donnees = resultat.data;
    const progression = Object.fromEntries(
      Object.entries(donnees).filter(([champ]) => !CHAMPS_HORS_PROGRESSION.has(champ))
    );
    const ok = await sauvegarderPersonnage(res.locals.compteId as number, id, { ...donnees, progression });
    if (!ok) {
      introuvable(res);
      return;
    }
    res.json({ savedAt: new Date().toISOString() });
  })
);

routeurPersonnages.delete(
  '/:id',
  asynchrone(async (req, res) => {
    const id = lireId(req, res);
    if (id === null) return;
    const nom = await supprimerPersonnage(res.locals.compteId as number, id);
    if (!nom) {
      introuvable(res);
      return;
    }
    journaliser({
      type: 'suppression_personnage',
      compteId: res.locals.compteId as number,
      adresseIp: adresseClient(req),
      details: { personnage_id: id, nom }
    });
    res.status(204).end();
  })
);

// --- Erreurs --------------------------------------------------------------
// Les refus de la base deviennent des messages clairs pour le joueur.
//   23514 = CHECK ou trigger (RAISE ... ERRCODE 'check_violation')
//   23505 = UNIQUE (nom déjà pris)
//   23503 = clé étrangère (objet encore référencé par un échange)
routeurPersonnages.use((erreur: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (erreur instanceof SauvegardeRefusee) {
    refuser(req, res, 400, erreur.message);
    return;
  }
  const pg = erreurPostgres(erreur) as { code?: string; constraint?: string; message?: string };
  if (pg.code === '23514') {
    refuser(req, res, 400, `Refusé par la base : ${messageLisible(pg)}`);
    return;
  }
  if (pg.code === '23505' && pg.constraint === 'personnage_nom_unique') {
    refuser(req, res, 409, 'Ce nom de héros est déjà pris.');
    return;
  }
  if (pg.code === '23503') {
    refuser(req, res, 409, 'Un objet de ce personnage est engagé dans un échange : impossible de le retirer.');
    return;
  }
  const baseInjoignable = pg.code === 'ECONNREFUSED' || (erreur instanceof Error && /connect|timeout/i.test(erreur.message));
  console.error('[personnages]', erreur instanceof Error ? erreur.message : erreur);
  res
    .status(baseInjoignable ? 503 : 500)
    .json({ erreur: baseInjoignable ? 'Base de données indisponible.' : 'Erreur interne du serveur.' });
});

// Message d'un trigger (« Emplacement « arme » déjà occupé... ») ou nom de la
// contrainte CHECK violée (« personnage_pv_max »).
function messageLisible(pg: { constraint?: string; message?: string }): string {
  if (pg.constraint) return `règle ${pg.constraint}`;
  return pg.message ?? 'donnée incohérente';
}
