-- =====================================================================
-- Mythologia — Mesures de performance (EXPLAIN ANALYZE)
--
-- Question : les index servent-ils vraiment ? On remplit la base comme
-- après plusieurs mois de jeu, puis on chronomètre les requêtes fréquentes
-- AVEC puis SANS leur index.
--
--   500 000 lignes de journal (6 mois d'activité)
--    20 000 personnages (4 000 comptes x 5), avec leur progression JSONB
--
-- Tout se passe dans une transaction annulée à la fin (ROLLBACK) :
-- la base n'est pas modifiée. Durée : environ 30 secondes.
--
-- Lancement (avec le propriétaire, car on supprime des index temporairement) :
--   docker compose exec -T postgres psql -U mythologia -d mythologia < packages/server/src/db/performances.sql
--
-- À lire dans chaque plan :
--   Seq Scan          = PostgreSQL lit TOUTE la table, ligne par ligne
--   Index Scan /
--   Bitmap Index Scan = PostgreSQL va directement aux bonnes lignes grâce à l'index
--   Execution Time    = temps réel de la requête
-- =====================================================================

\set ON_ERROR_STOP on
\pset pager off
BEGIN;

\echo '... génération des données (500 000 événements, 20 000 personnages)'
SET LOCAL session_replication_role = replica;   -- désactive les triggers pendant le remplissage massif

INSERT INTO compte (email, pseudo, mot_de_passe_hash)
SELECT 'joueur' || n || '@mesure.test', 'joueur_' || n, '!mesure'
  FROM generate_series(1, 4000) AS n;

INSERT INTO personnage (compte_id, classe_id, divinite_code, zone_id, nom, niveau, pv, pv_max, progression)
SELECT c.id,
       1 + (k % 4),
       (ARRAY['ZEUS','POSEIDON','HADES','ATHENA','ARES','APOLLO'])[1 + k % 6],
       1 + (k % 9),
       'heros_' || c.id || '_' || n,
       1 + (k % 40), 100, 100,
       jsonb_build_object(
           'discoveredZones', '["agora", "plaines"]'::jsonb,
           -- 1 personnage sur 1000 a vaincu la Sentinelle (rare), 1 sur 50 l'Hydre,
           -- 1 sur 25 le Minotaure, 1 sur 3 le Gardien
           'defeatedBosses', CASE WHEN k % 1000 = 0 THEN '["gardien_airain", "minotaure", "hydre_lerne", "sentinelle_poseidon"]'::jsonb
                                  WHEN k % 50 = 0 THEN '["gardien_airain", "minotaure", "hydre_lerne"]'::jsonb
                                  WHEN k % 25 = 0 THEN '["gardien_airain", "minotaure"]'::jsonb
                                  WHEN k % 3 = 0  THEN '["gardien_airain"]'::jsonb
                                  ELSE '[]'::jsonb END,
           'bestiaryKills', jsonb_build_object('satyre', k % 97, 'harpie', k % 53))
  FROM compte c
 CROSS JOIN generate_series(1, 5) AS n
 CROSS JOIN LATERAL (SELECT c.id * 5 + n AS k) AS numero
 WHERE c.pseudo LIKE 'joueur\_%';

INSERT INTO journal_evenement (compte_id, type, horodatage, adresse_ip, details)
SELECT (SELECT min(id) FROM compte) + (n % 4000),
       (ARRAY['connexion_reussie','connexion_reussie','connexion_reussie','deconnexion','deconnexion',
              'connexion_refusee','creation_personnage','sauvegarde_refusee','inscription','echange'])[1 + n % 10],
       now() - (n * interval '31 seconds'),     -- réparti sur environ 6 mois
       ('10.' || (n % 250) || '.' || (n % 199) || '.' || (1 + n % 250))::inet,
       '{}'
  FROM generate_series(1, 500000) AS n;

SET LOCAL session_replication_role = origin;
ANALYZE compte; ANALYZE personnage; ANALYZE journal_evenement;
-- Les lignes ajoutées en masse attendent dans la « liste d'attente » de l'index GIN :
-- on l'intègre à l'index, comme le ferait l'autovacuum en production.
SELECT gin_clean_pending_list('personnage_progression_gin'::regclass) AS pages_integrees_gin;

SELECT (SELECT count(*) FROM journal_evenement) AS lignes_journal,
       (SELECT count(*) FROM personnage) AS personnages;

-- ---------------------------------------------------------------------
\echo ''
\echo '=== 1. Connexions refusées de la dernière heure (détection de force brute)'
\echo '---   AVEC l''index journal_type_date_idx (type, horodatage DESC)'
EXPLAIN (ANALYZE, COSTS OFF)
SELECT adresse_ip, count(*) FROM journal_evenement
 WHERE type = 'connexion_refusee' AND horodatage > now() - interval '1 hour'
 GROUP BY adresse_ip;

\echo '---   SANS index'
DROP INDEX journal_type_date_idx;
EXPLAIN (ANALYZE, COSTS OFF)
SELECT adresse_ip, count(*) FROM journal_evenement
 WHERE type = 'connexion_refusee' AND horodatage > now() - interval '1 hour'
 GROUP BY adresse_ip;

-- ---------------------------------------------------------------------
\echo ''
\echo '=== 2. Les 20 derniers événements d''un compte (historique d''un joueur)'
\echo '---   AVEC l''index journal_compte_date_idx (compte_id, horodatage DESC)'
EXPLAIN (ANALYZE, COSTS OFF)
SELECT type, horodatage FROM journal_evenement
 WHERE compte_id = (SELECT min(id) + 1234 FROM compte)
 ORDER BY horodatage DESC LIMIT 20;

\echo '---   SANS index'
DROP INDEX journal_compte_date_idx;
EXPLAIN (ANALYZE, COSTS OFF)
SELECT type, horodatage FROM journal_evenement
 WHERE compte_id = (SELECT min(id) + 1234 FROM compte)
 ORDER BY horodatage DESC LIMIT 20;

-- ---------------------------------------------------------------------
\echo ''
\echo '=== 3. JSONB : recherche DANS le document de progression (index GIN)'
\echo '---   3a. Valeur RARE : qui a vaincu la Sentinelle ? (1 personnage sur 1000) - AVEC l''index GIN'
EXPLAIN (ANALYZE, COSTS OFF)
SELECT id, nom FROM personnage WHERE progression @> '{"defeatedBosses": ["sentinelle_poseidon"]}';

\echo '---   3b. Valeur plus FRÉQUENTE : qui a vaincu l''Hydre ? (1 sur 50) - AVEC l''index GIN'
\echo '        C''est le planificateur qui décide : il utilise l''index tant que c''est moins cher que tout lire'
EXPLAIN (ANALYZE, COSTS OFF)
SELECT id, nom FROM personnage WHERE progression @> '{"defeatedBosses": ["hydre_lerne"]}';

\echo '---   3a. Valeur RARE - SANS index'
DROP INDEX personnage_progression_gin;
EXPLAIN (ANALYZE, COSTS OFF)
SELECT id, nom FROM personnage WHERE progression @> '{"defeatedBosses": ["sentinelle_poseidon"]}';

-- ---------------------------------------------------------------------
\echo ''
\echo '=== 4. Unicité du nom de héros (index unique sur lower(nom)) : vérifier qu''un nom est libre'
EXPLAIN (ANALYZE, COSTS OFF)
SELECT 1 FROM personnage WHERE lower(nom) = lower('HEROS_2000_3');

\echo ''
\echo '=== Taille occupée sur le disque (table + index)'
SELECT relname AS objet, pg_size_pretty(pg_total_relation_size(oid)) AS taille
  FROM pg_class
 WHERE relname IN ('journal_evenement', 'personnage')
 ORDER BY relname;

ROLLBACK;
\echo ''
\echo 'Terminé : tout a été annulé (ROLLBACK), la base est inchangée.'
