// Bannit (ou débannit) un compte, et ferme immédiatement toutes ses sessions.
//
//   npm run admin:bannir -- <pseudo>            bannit le compte
//   npm run admin:bannir -- <pseudo> --annuler  lève le bannissement
//
// Sans Redis, un joueur banni garderait son jeton jusqu'à 2 heures.
// Ici, ses sessions sont supprimées : sa prochaine requête est refusée.
import { definirBanni, trouverCompteParPseudo } from '../db/requetes.js';
import { fermerBase } from '../db/client.js';
import { attendreRedis, fermerRedis } from '../redis/client.js';
import { revoquerSessionsDuCompte } from '../redis/sessions.js';

async function main(): Promise<void> {
  const [pseudo, option] = process.argv.slice(2);
  if (!pseudo) {
    console.error('Usage : npm run admin:bannir -- <pseudo> [--annuler]');
    process.exitCode = 1;
    return;
  }
  const compte = await trouverCompteParPseudo(pseudo);
  if (!compte) {
    console.error(`❌ Aucun compte « ${pseudo} ».`);
    process.exitCode = 1;
    return;
  }

  if (option === '--annuler') {
    await definirBanni(compte.id, false);
    console.log(`✅ ${compte.pseudo} n'est plus banni.`);
    return;
  }

  await definirBanni(compte.id, true);
  if (!(await attendreRedis())) {
    console.warn('⚠️  Compte banni dans PostgreSQL, mais Redis est injoignable : sessions non fermées.');
    return;
  }
  const fermees = await revoquerSessionsDuCompte(compte.id);
  console.log(`✅ ${compte.pseudo} est banni. Sessions fermées : ${fermees}.`);
}

main()
  .catch((erreur: unknown) => {
    console.error('❌ Erreur :', erreur instanceof Error ? erreur.message : erreur);
    process.exitCode = 1;
  })
  .finally(async () => {
    await fermerRedis();
    await fermerBase();
  });
