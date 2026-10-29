// Fonctions d'accès aux données utilisées par le reste du serveur.
// Le serveur de jeu et l'API n'écrivent jamais de SQL eux-mêmes :
// ils appellent ces fonctions.
import { asc, eq, sql } from 'drizzle-orm';
import { db } from './client.js';
import { classe, compte, divinite, personnage, zone } from './schema.js';

export function listerClasses() {
  return db.select().from(classe).orderBy(asc(classe.id));
}

export function listerDivinites() {
  return db.select().from(divinite).orderBy(asc(divinite.nom));
}

// Personnages d'un compte, avec le nom de leur classe, de leur dieu et de leur zone.
export function listerPersonnagesDuCompte(compteId: number) {
  return db
    .select({
      id: personnage.id,
      nom: personnage.nom,
      niveau: personnage.niveau,
      pv: personnage.pv,
      pvMax: personnage.pvMax,
      classe: classe.nom,
      divinite: divinite.nom,
      attaqueSpeciale: divinite.attaqueSpeciale,
      zone: zone.nom,
      royaume: zone.royaume
    })
    .from(personnage)
    .innerJoin(classe, eq(classe.id, personnage.classeId))
    .innerJoin(divinite, eq(divinite.code, personnage.diviniteCode))
    .innerJoin(zone, eq(zone.id, personnage.zoneId))
    .where(eq(personnage.compteId, compteId))
    .orderBy(asc(personnage.id));
}

export async function trouverCompteParPseudo(pseudo: string) {
  const [resultat] = await db
    .select()
    .from(compte)
    .where(sql`lower(${compte.pseudo}) = lower(${pseudo})`);
  return resultat ?? null;
}

// Réalise un échange de façon atomique (fonction effectuer_echange de schema.sql).
// En cas de problème (or insuffisant, objet équipé...), PostgreSQL annule tout
// et l'erreur remonte ici avec son message.
export async function effectuerEchange(echangeId: number): Promise<void> {
  await db.execute(sql`SELECT effectuer_echange(${echangeId})`);
}
