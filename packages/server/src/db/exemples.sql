-- =====================================================================
-- Mythologia — Requêtes d'exemple (à lancer après schema, seed et demo)
--
-- Elles montrent comment PostgreSQL remplace les bases retirées :
--   Neo4j         -> requêtes récursives (WITH RECURSIVE)
--   MongoDB       -> colonnes JSONB
--   Elasticsearch -> table journal_evenement
--
-- Lancement depuis la racine du dépôt :
--   docker compose exec -T postgres psql -U mythologia -d mythologia < packages/server/src/db/exemples.sql
-- =====================================================================

\echo '=== 1. Requête récursive : toutes les quêtes débloquées par « offrande_athena »'
WITH RECURSIVE suite AS (
    SELECT quete_id, 1 AS profondeur
      FROM quete_prerequis
     WHERE prerequis_id = 'offrande_athena'
    UNION
    SELECT qp.quete_id, s.profondeur + 1
      FROM quete_prerequis qp
      JOIN suite s ON qp.prerequis_id = s.quete_id
)
SELECT q.titre, min(s.profondeur) AS etapes_plus_tard
  FROM suite s JOIN quete q ON q.id = s.quete_id
 GROUP BY q.titre
 ORDER BY etapes_plus_tard, q.titre;

\echo '=== 2. Quêtes que Persée peut commencer maintenant (prérequis terminés, niveau suffisant)'
SELECT q.titre, q.niveau_requis
  FROM quete q, personnage p
 WHERE p.nom = 'Persée'
   AND q.niveau_requis <= p.niveau
   AND NOT EXISTS (SELECT 1 FROM progression_quete pq
                    WHERE pq.personnage_id = p.id AND pq.quete_id = q.id)
   AND NOT EXISTS (SELECT 1 FROM quete_prerequis qp
                    WHERE qp.quete_id = q.id
                      AND NOT EXISTS (SELECT 1 FROM progression_quete pq
                                       WHERE pq.personnage_id = p.id
                                         AND pq.quete_id = qp.prerequis_id
                                         AND pq.statut = 'terminee'));

\echo '=== 3. Requête récursive : amis et amis d''amis de Persée (jusqu''à 2 niveaux)'
WITH RECURSIVE reseau AS (
    SELECT a.ami_id, 1 AS distance
      FROM v_amis a JOIN personnage p ON p.id = a.personnage_id
     WHERE p.nom = 'Persée'
    UNION
    SELECT a.ami_id, r.distance + 1
      FROM reseau r JOIN v_amis a ON a.personnage_id = r.ami_id
     WHERE r.distance < 2
)
SELECT p.nom, min(r.distance) AS distance,
       CASE min(r.distance) WHEN 1 THEN 'ami' ELSE 'ami d''ami' END AS lien
  FROM reseau r JOIN personnage p ON p.id = r.ami_id
 WHERE p.nom <> 'Persée'
 GROUP BY p.nom
 ORDER BY distance;

\echo '=== 4. JSONB : quêtes qui contiennent un combat (utilise l''index GIN)'
SELECT titre FROM quete WHERE etapes @> '[{"type": "combat"}]';

\echo '=== 5. JSONB : armes avec au moins 7 d''attaque, et nombre de phases de chaque boss'
SELECT nom, (statistiques ->> 'attaque')::int AS attaque
  FROM objet
 WHERE (statistiques ->> 'attaque')::int >= 7
 ORDER BY attaque DESC;

SELECT nom, jsonb_array_length(phases) AS nb_phases FROM boss ORDER BY nb_phases DESC, nom;

\echo '=== 6. Journal : rafales de connexions refusées (plus de 10 par minute depuis une même adresse)'
SELECT adresse_ip,
       date_trunc('minute', horodatage) AS minute,
       count(*) AS tentatives
  FROM journal_evenement
 WHERE type = 'connexion_refusee'
 GROUP BY adresse_ip, minute
HAVING count(*) > 10
 ORDER BY tentatives DESC;
-- En temps réel, le serveur ferait plutôt :
--   ... WHERE type = 'connexion_refusee' AND horodatage > now() - interval '1 minute' ...

\echo '=== 7. Guilde : membres et rangs'
SELECT g.sigle, p.nom, m.rang
  FROM membre_guilde m
  JOIN guilde g ON g.id = m.guilde_id
  JOIN personnage p ON p.id = m.personnage_id
 ORDER BY g.sigle, m.rang, p.nom;

\echo '=== 8. Preuve que l''index GIN est utilisé (seqscan désactivé car la table est petite)'
SET enable_seqscan = off;
EXPLAIN (COSTS OFF) SELECT titre FROM quete WHERE etapes @> '[{"type": "combat"}]';
RESET enable_seqscan;
