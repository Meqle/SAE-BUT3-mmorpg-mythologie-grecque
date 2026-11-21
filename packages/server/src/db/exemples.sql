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

\echo '=== 1. Requête récursive : toutes les quêtes débloquées par « mq_1_etincelle »'
WITH RECURSIVE suite AS (
    SELECT quete_id, 1 AS profondeur
      FROM quete_prerequis
     WHERE prerequis_id = 'mq_1_etincelle'
    UNION
    SELECT qp.quete_id, s.profondeur + 1
      FROM quete_prerequis qp
      JOIN suite s ON qp.prerequis_id = s.quete_id
)
SELECT q.titre, q.type, min(s.profondeur) AS etapes_plus_tard
  FROM suite s JOIN quete q ON q.id = s.quete_id
 GROUP BY q.titre, q.type
 ORDER BY etapes_plus_tard, q.titre;

\echo '=== 2. Quêtes que Persée peut accepter maintenant (prérequis terminés, pas encore commencées)'
SELECT q.titre, q.type, q.niveau_conseille
  FROM quete q, personnage p
 WHERE p.nom = 'Persée'
   AND NOT EXISTS (SELECT 1 FROM progression_quete pq
                    WHERE pq.personnage_id = p.id AND pq.quete_id = q.id)
   AND NOT EXISTS (SELECT 1 FROM quete_prerequis qp
                    WHERE qp.quete_id = q.id
                      AND NOT EXISTS (SELECT 1 FROM progression_quete pq
                                       WHERE pq.personnage_id = p.id
                                         AND pq.quete_id = qp.prerequis_id
                                         AND pq.statut = 'terminee'))
 ORDER BY q.niveau_conseille, q.titre;

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

\echo '=== 4. JSONB : quêtes qui demandent de vaincre le Minotaure (utilise l''index GIN)'
SELECT titre FROM quete WHERE etapes @> '[{"type": "kill", "targetId": "minotaure"}]';

\echo '=== 5. JSONB : équipements avec au moins 10 d''attaque, et nombre de phases de chaque boss divin'
SELECT nom, emplacement, rarete, (statistiques ->> 'attaque')::int AS attaque
  FROM objet
 WHERE (statistiques ->> 'attaque')::int >= 10
 ORDER BY attaque DESC, nom;

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

\echo '=== 8. JSONB : personnages qui ont vaincu le Gardien d''Airain, et monstres les plus chassés'
SELECT nom, niveau FROM personnage WHERE progression @> '{"defeatedBosses": ["gardien_airain"]}';

SELECT p.nom, b.monstre, b.nombre::int AS nombre
  FROM personnage p,
       jsonb_each_text(p.progression -> 'bestiaryKills') AS b(monstre, nombre)
 ORDER BY nombre DESC
 LIMIT 5;

\echo '=== 9. Inventaire : équipement porté par Persée, par emplacement'
SELECT o.emplacement, o.nom, o.rarete, o.statistiques
  FROM instance_objet i
  JOIN objet o ON o.id = i.objet_id
  JOIN personnage p ON p.id = i.proprietaire_id
 WHERE p.nom = 'Persée' AND i.equipe
 ORDER BY o.emplacement;

\echo '=== 10. Preuve que l''index GIN est utilisé (seqscan désactivé car la table est petite)'
SET enable_seqscan = off;
EXPLAIN (COSTS OFF) SELECT titre FROM quete WHERE etapes @> '[{"type": "kill", "targetId": "minotaure"}]';
RESET enable_seqscan;
