// Petit script pour vérifier que le serveur arrive à parler à la base.
// Lancement : npm run db:verifier
import { count } from 'drizzle-orm';
import { baseDisponible, db, fermerBase } from './client.js';
import { classe, compte, objet, personnage } from './schema.js';
import { listerDivinites, listerPersonnagesDuCompte, trouverCompteParPseudo } from './requetes.js';

async function main(): Promise<void> {
  if (!(await baseDisponible())) {
    console.error('❌ Impossible de joindre PostgreSQL.');
    console.error('   Vérifiez que la base tourne : docker compose up -d postgres');
    console.error('   et que POSTGRES_PORT dans .env correspond au port publié.');
    process.exitCode = 1;
    return;
  }
  console.log('✅ Connexion à PostgreSQL réussie\n');

  const [classes] = await db.select({ n: count() }).from(classe);
  const [objets] = await db.select({ n: count() }).from(objet);
  const [comptes] = await db.select({ n: count() }).from(compte);
  const [personnages] = await db.select({ n: count() }).from(personnage);
  console.table({
    classes: classes.n,
    objets: objets.n,
    comptes: comptes.n,
    personnages: personnages.n
  });

  console.log('Divinités :');
  for (const dieu of await listerDivinites()) {
    console.log(`  - ${dieu.nom} (${dieu.royaume}) : ${dieu.attaqueSpeciale}`);
  }

  const demo = await trouverCompteParPseudo('demo_persee');
  if (demo) {
    console.log(`\nPersonnages du compte « ${demo.pseudo} » :`);
    console.table(await listerPersonnagesDuCompte(demo.id));
  }
}

main()
  .catch((error: unknown) => {
    console.error('❌ Erreur :', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => fermerBase());
