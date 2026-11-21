// Bannit (ou débannit) un compte, et ferme immédiatement toutes ses sessions.
//
//   npm run admin:bannir -- <pseudo>            bannit le compte
//   npm run admin:bannir -- <pseudo> --motif triche inventaire   bannit avec un motif
//   npm run admin:bannir -- <pseudo> --annuler  lève le bannissement
//
// Chaque sanction est inscrite dans le journal (type « sanction »).
//
// Sans Redis, un joueur banni garderait son jeton jusqu'à 2 heures.
// Ici, ses sessions sont supprimées : sa prochaine requête est refusée.
import { definirBanni, trouverCompteParPseudo } from '../db/requetes.js';
import { fermerBase } from '../db/client.js';
import { attendreRedis, fermerRedis } from '../redis/client.js';
import { revoquerSessionsDuCompte } from '../redis/sessions.js';
import { attendreJournal, journaliser } from '../journal/journal.js';

async function main(): Promise<void> {
  const [pseudo, option, ...motif] = process.argv.slice(2);
  if (!pseudo) {
    console.error('Usage : npm run admin:bannir -- <pseudo> [--annuler]   ou   -- <pseudo> --motif <texte>');
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
    journaliser({ type: 'sanction', compteId: compte.id, details: { action: 'levee_bannissement', par: 'console_admin' } });
    console.log(`✅ ${compte.pseudo} n'est plus banni.`);
    return;
  }

  await definirBanni(compte.id, true);
  journaliser({
    type: 'sanction',
    compteId: compte.id,
    details: { action: 'bannissement', par: 'console_admin', motif: option === '--motif' ? motif.join(' ') : null }
  });
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
    await attendreJournal();
    await fermerRedis();
    await fermerBase();
  });
