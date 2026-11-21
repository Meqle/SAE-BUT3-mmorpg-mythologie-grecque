// Classement en direct, avec un « sorted set » Redis.
//
// Un sorted set garde des éléments TOUJOURS triés par score. Ajouter des
// points (ZINCRBY) ou lire le top 10 (ZREVRANGE) est instantané, même avec
// des milliers de joueurs. Faire la même chose en SQL demanderait un tri à
// chaque affichage.
//
// Rôle de chaque base :
//   - Redis : le classement EN DIRECT de la saison en cours.
//   - PostgreSQL (table classement_saison) : la sauvegarde durable.
// Si la clé Redis n'existe pas (premier affichage, Redis redémarré...), on la
// recharge depuis PostgreSQL : c'est le principe du « cache-aside ».
//
// Clé utilisée :
//   classement:saison:<n>  -> sorted set (membre = id du personnage, score = points)
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { classementSaison, personnage } from '../db/schema.js';
import { avecRedis, redis } from './client.js';

const cleClassement = (saison: number) => `classement:saison:${saison}`;

export interface LigneClassement {
  rang: number;
  personnageId: number;
  personnage: string;
  score: number;
}

// Recharge le classement d'une saison depuis PostgreSQL vers Redis.
export async function chargerDepuisPostgres(saison: number): Promise<number> {
  const lignes = await db
    .select({ personnageId: classementSaison.personnageId, score: classementSaison.score })
    .from(classementSaison)
    .where(eq(classementSaison.saison, saison));
  if (lignes.length === 0) return 0;
  const scoresEtMembres = lignes.flatMap((l) => [l.score, String(l.personnageId)]);
  await avecRedis(() => redis.zadd(cleClassement(saison), ...scoresEtMembres));
  return lignes.length;
}

// Ajoute des points à un personnage et renvoie son nouveau score.
// (Appelée par le serveur de jeu : victoire contre un boss, quête terminée...)
export async function ajouterPoints(saison: number, personnageId: number, points: number): Promise<number> {
  await assurerChargement(saison);
  const score = await avecRedis(() => redis.zincrby(cleClassement(saison), points, String(personnageId)));
  return Number(score);
}

async function assurerChargement(saison: number): Promise<void> {
  const existe = await avecRedis(() => redis.exists(cleClassement(saison)));
  if (!existe) await chargerDepuisPostgres(saison);
}

// Les meilleurs joueurs de la saison, du premier au dernier.
export async function meilleursJoueurs(saison: number, limite: number): Promise<LigneClassement[]> {
  await assurerChargement(saison);
  // WITHSCORES renvoie [membre1, score1, membre2, score2, ...]
  const brut = await avecRedis(() => redis.zrevrange(cleClassement(saison), 0, limite - 1, 'WITHSCORES'));
  const entrees: { personnageId: number; score: number }[] = [];
  for (let i = 0; i < brut.length; i += 2) {
    entrees.push({ personnageId: Number(brut[i]), score: Number(brut[i + 1]) });
  }
  if (entrees.length === 0) return [];

  // Redis ne garde que les identifiants : les noms viennent de PostgreSQL.
  const noms = await db
    .select({ id: personnage.id, nom: personnage.nom })
    .from(personnage)
    .where(inArray(personnage.id, entrees.map((e) => e.personnageId)));
  const nomParId = new Map(noms.map((n) => [n.id, n.nom]));

  return entrees
    .filter((e) => nomParId.has(e.personnageId)) // personnage supprimé entre-temps
    .map((e, index) => ({
      rang: index + 1,
      personnageId: e.personnageId,
      personnage: nomParId.get(e.personnageId)!,
      score: e.score
    }));
}

// Rang d'un personnage (1 = premier), ou null s'il n'est pas classé.
export async function rangDe(saison: number, personnageId: number): Promise<number | null> {
  await assurerChargement(saison);
  const rang = await avecRedis(() => redis.zrevrank(cleClassement(saison), String(personnageId)));
  return rang === null ? null : rang + 1;
}

// Sauvegarde le classement en direct dans PostgreSQL (fin de saison, ou régulièrement).
export async function sauvegarderDansPostgres(saison: number): Promise<number> {
  const brut = await avecRedis(() => redis.zrange(cleClassement(saison), 0, -1, 'WITHSCORES'));
  const lignes: { personnageId: number; saison: number; score: number }[] = [];
  for (let i = 0; i < brut.length; i += 2) {
    lignes.push({ personnageId: Number(brut[i]), saison, score: Math.round(Number(brut[i + 1])) });
  }
  if (lignes.length === 0) return 0;
  await db
    .insert(classementSaison)
    .values(lignes)
    .onConflictDoUpdate({
      target: [classementSaison.personnageId, classementSaison.saison],
      set: { score: sql`excluded.score` }
    });
  return lignes.length;
}
