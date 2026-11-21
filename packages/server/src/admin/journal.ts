// Rapport de sécurité tiré du journal des événements.
//
//   npm run admin:journal              les dernières 24 heures
//   npm run admin:journal -- 168       les 168 dernières heures (7 jours)
//
// Affiche : les derniers événements, les rafales de connexions refusées
// (force brute), les comptes les plus visés et les joueurs dont les
// sauvegardes sont souvent refusées (bug ou triche).
import { sql } from 'drizzle-orm';
import { db, fermerBase } from '../db/client.js';

async function main(): Promise<void> {
  const heures = Number(process.argv[2] ?? 24);
  if (!Number.isInteger(heures) || heures < 1 || heures > 24 * 365) {
    console.error('Usage : npm run admin:journal -- [nombre d\'heures, 24 par défaut]');
    process.exitCode = 1;
    return;
  }
  const depuis = sql`now() - make_interval(hours => ${heures})`;

  console.log(`\n=== Journal des ${heures} dernières heures ===\n`);

  const parType = await db.execute(sql`
    SELECT type, count(*)::int AS nombre
      FROM journal_evenement
     WHERE horodatage > ${depuis}
     GROUP BY type
     ORDER BY nombre DESC`);
  console.log('Événements par type :');
  console.table(parType.rows);

  const derniers = await db.execute(sql`
    SELECT to_char(j.horodatage AT TIME ZONE 'Europe/Paris', 'DD/MM HH24:MI:SS') AS quand,
           j.type,
           coalesce(c.pseudo, '—') AS compte,
           coalesce(host(j.adresse_ip), '—') AS adresse_ip,
           j.details::text AS details
      FROM journal_evenement j
      LEFT JOIN compte c ON c.id = j.compte_id
     ORDER BY j.horodatage DESC, j.id DESC
     LIMIT 15`);
  console.log('15 derniers événements :');
  console.table(derniers.rows);

  // Force brute : plus de 10 connexions refusées en une minute depuis une même adresse.
  const rafales = await db.execute(sql`
    SELECT coalesce(host(adresse_ip), 'inconnue') AS adresse_ip,
           to_char(date_trunc('minute', horodatage) AT TIME ZONE 'Europe/Paris', 'DD/MM HH24:MI') AS minute,
           count(*)::int AS tentatives,
           count(DISTINCT coalesce(compte_id::text, details ->> 'identifiant_tente'))::int AS comptes_vises
      FROM journal_evenement
     WHERE type = 'connexion_refusee' AND horodatage > ${depuis}
     GROUP BY adresse_ip, date_trunc('minute', horodatage)
    HAVING count(*) > 10
     ORDER BY tentatives DESC
     LIMIT 10`);
  console.log(rafales.rows.length ? '⚠️  Rafales de connexions refusées (plus de 10 par minute) :' : '✅ Aucune rafale de connexions refusées.');
  if (rafales.rows.length) console.table(rafales.rows);

  // Comptes existants qui reçoivent beaucoup de mauvais mots de passe.
  const vises = await db.execute(sql`
    SELECT c.pseudo, count(*)::int AS refus, count(DISTINCT j.adresse_ip)::int AS adresses
      FROM journal_evenement j
      JOIN compte c ON c.id = j.compte_id
     WHERE j.type = 'connexion_refusee' AND j.horodatage > ${depuis}
     GROUP BY c.pseudo
    HAVING count(*) >= 5
     ORDER BY refus DESC
     LIMIT 10`);
  console.log(vises.rows.length ? '⚠️  Comptes visés (5 refus ou plus) :' : '✅ Aucun compte visé.');
  if (vises.rows.length) console.table(vises.rows);

  // Sauvegardes refusées : la base a bloqué une donnée impossible (3 reliques, quête sautée...).
  const suspects = await db.execute(sql`
    SELECT c.pseudo, count(*)::int AS refus,
           (array_agg(j.details ->> 'motif' ORDER BY j.horodatage DESC))[1] AS dernier_motif
      FROM journal_evenement j
      JOIN compte c ON c.id = j.compte_id
     WHERE j.type = 'sauvegarde_refusee' AND j.horodatage > ${depuis}
     GROUP BY c.pseudo
     ORDER BY refus DESC
     LIMIT 10`);
  console.log(suspects.rows.length ? '⚠️  Sauvegardes refusées (bug du jeu ou triche) :' : '✅ Aucune sauvegarde refusée.');
  if (suspects.rows.length) console.table(suspects.rows);
}

main()
  .catch((erreur: unknown) => {
    console.error('❌ Erreur :', erreur instanceof Error ? erreur.message : erreur);
    process.exitCode = 1;
  })
  .finally(() => fermerBase());
