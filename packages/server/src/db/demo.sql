-- =====================================================================
-- Mythologia — Données de démonstration (développement uniquement)
-- Deux joueurs fictifs, leurs objets et un échange prêt à être réalisé.
-- Ces comptes ne permettent PAS de se connecter : leur "hash" est factice.
--
-- Pour tester l'échange atomique :
--   SELECT effectuer_echange(1);
--   SELECT p.nom, o.nom FROM instance_objet i
--     JOIN personnage p ON p.id = i.proprietaire_id
--     JOIN objet o ON o.id = i.objet_id;
-- =====================================================================

BEGIN;

INSERT INTO compte (email, pseudo, mot_de_passe_hash) VALUES
    ('demo.persee@mythologia.test',   'demo_persee',   '!demo-aucune-connexion'),
    ('demo.atalante@mythologia.test', 'demo_atalante', '!demo-aucune-connexion');

INSERT INTO personnage (compte_id, classe_id, divinite_code, zone_id, nom, niveau, pv, pv_max, pieces_or)
SELECT c.id, cl.id, d.divinite, z.id, d.nom, d.niveau, cl.pv_base, cl.pv_base, d.pieces_or
FROM (VALUES
    ('demo_persee',   'GUERRIER', 'ATHENA', 'Persée',   12, 300),
    ('demo_atalante', 'ARCHER',   'APOLLO', 'Atalante', 10, 150)
) AS d(pseudo, classe, divinite, nom, niveau, pieces_or)
JOIN compte c  ON c.pseudo = d.pseudo
JOIN classe cl ON cl.code = d.classe
JOIN zone z    ON z.nom = 'Agora de l''Olympe';

INSERT INTO instance_objet (objet_id, proprietaire_id, quantite, equipe)
SELECT o.id, p.id, d.quantite, d.equipe
FROM (VALUES
    ('Persée',   'Épée de bronze',         1, TRUE),
    ('Persée',   'Bouclier d''hoplite',    1, FALSE),
    ('Persée',   'Potion d''ambroisie',    5, FALSE),
    ('Atalante', 'Arc en bois d''olivier', 1, TRUE),
    ('Atalante', 'Éclat de foudre',        2, FALSE)
) AS d(personnage, objet, quantite, equipe)
JOIN personnage p ON p.nom = d.personnage
JOIN objet o      ON o.nom = d.objet;

INSERT INTO victoire_boss (personnage_id, boss_code, duree_combat_s)
SELECT id, 'BOSS_ATHENA', 184 FROM personnage WHERE nom = 'Persée';

INSERT INTO classement_saison (personnage_id, saison, score)
SELECT id, 1, CASE nom WHEN 'Persée' THEN 1250 ELSE 980 END FROM personnage;

INSERT INTO progression_quete (personnage_id, quete_id, statut)
SELECT id, 'quete_tutoriel_agora', 'terminee' FROM personnage;

-- Échange proposé : Persée donne son bouclier + 50 pièces d'or,
-- Atalante donne ses 2 éclats de foudre.
INSERT INTO interaction (emetteur_id, destinataire_id, type)
SELECT e.id, d.id, 'echange'
FROM personnage e, personnage d
WHERE e.nom = 'Persée' AND d.nom = 'Atalante';

INSERT INTO echange (interaction_id, or_emetteur, or_destinataire)
SELECT id, 50, 0 FROM interaction WHERE type = 'echange';

INSERT INTO ligne_echange (echange_id, instance_id, donneur_id)
SELECT e.id, i.id, i.proprietaire_id
FROM echange e, instance_objet i
JOIN objet o ON o.id = i.objet_id
WHERE o.nom IN ('Bouclier d''hoplite', 'Éclat de foudre');

COMMIT;
