-- =====================================================================
-- Mythologia — Rôles PostgreSQL (principe du moindre privilège)
--
-- Le serveur ne se connecte PAS avec le compte propriétaire de la base
-- (celui qui a créé les tables), mais avec un rôle limité :
--
--   mythologia (propriétaire)  crée et modifie la structure : tables, triggers...
--                              utilisé seulement pour l'installation et la maintenance.
--   mythologia_app (serveur)   lit et écrit les données du jeu, rien de plus :
--                              - ne peut PAS supprimer ni modifier une table (DROP, ALTER) ;
--                              - ne peut PAS modifier les référentiels (objets, quêtes, zones...) ;
--                              - ne peut qu'AJOUTER dans le journal (ni UPDATE, ni DELETE).
--   mythologia_lecture         lecture seule, pour consulter la base (DBeaver, statistiques).
--
-- Intérêt : si un jour le serveur a une faille (injection SQL, bug), les
-- dégâts sont limités à ce que mythologia_app a le droit de faire.
--
-- Exécuté automatiquement par Docker au premier démarrage (04_roles.sh),
-- après schema.sql, seed.sql et demo.sql. Variables psql attendues :
--   app_password, lecture_password
-- =====================================================================

BEGIN;

CREATE ROLE mythologia_app LOGIN PASSWORD :'app_password';
CREATE ROLE mythologia_lecture LOGIN PASSWORD :'lecture_password';

-- Personne d'autre que le propriétaire ne peut créer d'objet dans le schéma.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO mythologia_app, mythologia_lecture;

-- ---------------------------------------------------------------------
-- Lecture seule : tout lire, y compris les vues.
-- ---------------------------------------------------------------------
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mythologia_lecture;

-- ---------------------------------------------------------------------
-- Serveur de jeu
-- ---------------------------------------------------------------------

-- 1. Il peut tout lire.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mythologia_app;

-- 2. Données des joueurs : lecture et écriture.
GRANT INSERT, UPDATE, DELETE ON
    compte, personnage, instance_objet, progression_quete,
    guilde, membre_guilde, amitie,
    session_jeu, victoire_boss, classement_saison,
    interaction, echange, ligne_echange
TO mythologia_app;

-- 3. Journal : ajout seulement. Même avec une faille dans le serveur,
--    impossible d'effacer ses traces (en plus du trigger journal_infalsifiable).
GRANT INSERT ON journal_evenement TO mythologia_app;

-- 4. Référentiels (objet, classe, divinite, zone, boss, quete, quete_prerequis) :
--    aucun droit d'écriture. Un joueur ne peut pas, même via une faille,
--    rendre son épée plus puissante ou créer un objet.

-- 5. Numéros automatiques (colonnes GENERATED ... AS IDENTITY).
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO mythologia_app;

-- 6. Fonctions (effectuer_echange...) : exécutables par le serveur, pas par la lecture seule.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO mythologia_app;

-- Tables créées plus tard par le propriétaire : lisibles automatiquement
-- (les droits d'écriture, eux, devront être donnés explicitement).
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mythologia_app, mythologia_lecture;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO mythologia_app;

COMMIT;
