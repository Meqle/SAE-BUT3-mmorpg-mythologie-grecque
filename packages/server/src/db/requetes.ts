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

// Pour la connexion : le joueur peut taper son pseudo ou son email.
export async function trouverCompteParIdentifiant(identifiant: string) {
  const [resultat] = await db
    .select()
    .from(compte)
    .where(sql`lower(${compte.pseudo}) = lower(${identifiant}) OR lower(${compte.email}) = lower(${identifiant})`)
    .limit(1);
  return resultat ?? null;
}

export async function trouverCompteParId(id: number) {
  const [resultat] = await db.select().from(compte).where(eq(compte.id, id));
  return resultat ?? null;
}

// Les contraintes UNIQUE de la base refusent un pseudo ou un email déjà pris :
// c'est fiable même si deux inscriptions identiques arrivent en même temps.
export async function creerCompte(donnees: { email: string; pseudo: string; motDePasseHash: string }) {
  const [nouveau] = await db.insert(compte).values(donnees).returning();
  return nouveau;
}

// Réalise un échange de façon atomique (fonction effectuer_echange de schema.sql).
// En cas de problème (or insuffisant, objet équipé...), PostgreSQL annule tout
// et l'erreur remonte ici avec son message.
export async function effectuerEchange(echangeId: number): Promise<void> {
  await db.execute(sql`SELECT effectuer_echange(${echangeId})`);
}
