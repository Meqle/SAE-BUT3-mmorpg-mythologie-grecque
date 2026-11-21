-- =====================================================================
-- Mythologia — Données de démonstration (développement uniquement)
-- Trois joueurs fictifs, leurs objets, un échange prêt à être réalisé,
-- une guilde, des amitiés, des quêtes en cours et un extrait de journal.
-- Ces comptes ne permettent PAS de se connecter : leur "hash" est factice.
-- Requêtes à essayer : voir exemples.sql
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

INSERT INTO personnage (compte_id, classe_id, divinite_code, zone_id, nom, niveau, experience, pv, pv_max, pieces_or, progression)
SELECT c.id, cl.id, d.divinite, z.id, d.nom, d.niveau, d.xp, cl.pv_base, cl.pv_base, d.pieces_or, d.progression::jsonb
FROM (VALUES
    ('demo_persee',   'GUERRIER', 'ATHENA', 'rivage',     'Persée',   12, 420, 300,
     '{"prologueSeen": true, "discoveredZones": ["agora", "plaines", "sanctuaire", "rivage"],
       "defeatedBosses": ["gardien_airain", "centaure", "sentinelle_poseidon"],
       "bestiaryKills": {"satyre": 21, "harpie": 14, "automate": 6, "squelette": 2},
       "skillPoints": 2, "unlockedSkills": {"w_plate": 3, "w_taunt": 1}}'),
    ('demo_atalante', 'ARCHER',   'APOLLO', 'plaines',    'Atalante', 10, 150, 150,
     '{"prologueSeen": true, "discoveredZones": ["agora", "plaines"],
       "defeatedBosses": [], "bestiaryKills": {"satyre": 3, "harpie": 1}, "skillPoints": 1}')
) AS d(pseudo, classe, divinite, zone, nom, niveau, xp, pieces_or, progression)
JOIN compte c  ON c.pseudo = d.pseudo
JOIN classe cl ON cl.code = d.classe
JOIN zone z    ON z.code = d.zone;

-- Inventaire : la base vérifie les règles (un objet non empilable a une
-- quantité de 1, un seul objet équipé par emplacement, deux reliques au plus).
INSERT INTO instance_objet (objet_id, proprietaire_id, quantite, equipe)
SELECT o.id, p.id, d.quantite, d.equipe
FROM (VALUES
    ('Persée',   'epee_bronze',       1, TRUE),
    ('Persée',   'casque_corinthien', 1, TRUE),
    ('Persée',   'coeur_braise',      1, TRUE),
    ('Persée',   'coeur_airain',      1, TRUE),
    ('Persée',   'bouclier_hoplite',  1, FALSE),
    ('Persée',   'potion_ambroisie',  5, FALSE),
    ('Atalante', 'arc_olivier',       1, TRUE),
    ('Atalante', 'eclat_foudre',      2, FALSE),
    ('Atalante', 'herbe_ambroisie',   1, FALSE)
) AS d(personnage, objet, quantite, equipe)
JOIN personnage p ON p.nom = d.personnage
JOIN objet o      ON o.code = d.objet;

INSERT INTO victoire_boss (personnage_id, boss_code, duree_combat_s)
SELECT id, 'BOSS_ATHENA', 184 FROM personnage WHERE nom = 'Persée';

INSERT INTO classement_saison (personnage_id, saison, score)
SELECT id, 1, CASE nom WHEN 'Persée' THEN 1250 ELSE 980 END FROM personnage;

-- Quêtes : insérées dans l'ordre, car la base vérifie les prérequis.
INSERT INTO progression_quete (personnage_id, quete_id, statut, compteurs)
SELECT p.id, d.quete, d.statut, d.compteurs::jsonb
FROM (VALUES
    ('Persée',   'mq_1_etincelle',         'terminee', '{"light_brasero": 1}'),
    ('Persée',   'sq_ambroisie_perdue',    'terminee', '{"collect_herbs": 3}'),
    ('Atalante', 'mq_1_etincelle',         'terminee', '{"light_brasero": 1}'),
    ('Atalante', 'sq_ambroisie_perdue',    'en_cours', '{"collect_herbs": 1}')
) AS d(personnage, quete, statut, compteurs)
JOIN personnage p ON p.nom = d.personnage;

INSERT INTO progression_quete (personnage_id, quete_id, statut, compteurs)
SELECT p.id, d.quete, d.statut, d.compteurs::jsonb
FROM (VALUES
    ('Persée',   'mq_2_terres_foudroyees', 'terminee', '{"kill_satyres": 3, "kill_harpies": 2, "read_stele": 1}'),
    ('Persée',   'sq_portes_chaos',        'terminee', '{"kill_centaure": 1}'),
    ('Atalante', 'mq_2_terres_foudroyees', 'en_cours', '{"kill_satyres": 3, "kill_harpies": 1, "read_stele": 0}')
) AS d(personnage, quete, statut, compteurs)
JOIN personnage p ON p.nom = d.personnage;

INSERT INTO progression_quete (personnage_id, quete_id, statut, compteurs)
SELECT id, 'mq_3_sanctuaire', 'terminee', '{"enter_sanctuaire": 1, "kill_automates": 2, "kill_gardien": 1}'
FROM personnage WHERE nom = 'Persée';

INSERT INTO progression_quete (personnage_id, quete_id, statut, compteurs)
SELECT p.id, d.quete, d.statut, d.compteurs::jsonb
FROM (VALUES
    ('mq_4_rivage_epreuve',  'a_rendre', '{"activate_steles": 3, "kill_sentinel": 1}'),
    ('sq_chasse_squelettes', 'en_cours', '{"kill_squelettes": 2}')
) AS d(quete, statut, compteurs)
CROSS JOIN personnage p WHERE p.nom = 'Persée';

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
WHERE o.code IN ('bouclier_hoplite', 'eclat_foudre');

-- Un troisième joueur, pour montrer les « amis d'amis ».
INSERT INTO compte (email, pseudo, mot_de_passe_hash) VALUES
    ('demo.jason@mythologia.test', 'demo_jason', '!demo-aucune-connexion');

INSERT INTO personnage (compte_id, classe_id, divinite_code, zone_id, nom, niveau, pv, pv_max, pieces_or, progression)
SELECT c.id, cl.id, 'ZEUS', z.id, 'Jason', 8, cl.pv_base, cl.pv_base, 90,
       '{"prologueSeen": true, "discoveredZones": ["agora"], "defeatedBosses": []}'
FROM compte c, classe cl, zone z
WHERE c.pseudo = 'demo_jason' AND cl.code = 'MAGE' AND z.code = 'agora';

INSERT INTO instance_objet (objet_id, proprietaire_id, quantite, equipe)
SELECT o.id, p.id, 1, TRUE FROM objet o, personnage p
WHERE o.code = 'baton_oracle' AND p.nom = 'Jason';

-- Guilde : Persée en est le chef, Atalante membre (Jason n'est dans aucune guilde).
INSERT INTO guilde (nom, sigle) VALUES ('Les Argonautes', 'ARGO');

INSERT INTO membre_guilde (personnage_id, guilde_id, rang)
SELECT p.id, g.id, CASE p.nom WHEN 'Persée' THEN 'chef' ELSE 'membre' END
FROM personnage p, guilde g
WHERE p.nom IN ('Persée', 'Atalante') AND g.sigle = 'ARGO';

-- Amitiés : Persée <-> Atalante, Atalante <-> Jason.
-- Jason est donc un « ami d'ami » de Persée.
INSERT INTO amitie (demandeur_id, destinataire_id, statut)
SELECT a.id, b.id, 'acceptee'
FROM (VALUES ('Persée', 'Atalante'), ('Jason', 'Atalante')) AS d(demandeur, destinataire)
JOIN personnage a ON a.nom = d.demandeur
JOIN personnage b ON b.nom = d.destinataire;

-- Journal : activité normale, puis une rafale suspecte de 12 connexions refusées
-- en moins d'une minute depuis la même adresse (attaque par force brute).
INSERT INTO journal_evenement (compte_id, type, horodatage, adresse_ip, details)
SELECT c.id, 'inscription', '2026-11-10 18:00:00+01'::timestamptz + (c.id || ' minutes')::interval,
       '192.0.2.10', '{}'
FROM compte c;

INSERT INTO journal_evenement (compte_id, type, horodatage, adresse_ip, details)
SELECT c.id, e.type, e.quand::timestamptz, '192.0.2.10', e.details::jsonb
FROM (VALUES
    ('connexion_refusee', '2026-11-15 20:58:10+01', '{"motif": "mot_de_passe"}'),
    ('connexion_reussie', '2026-11-15 20:58:40+01', '{}'),
    ('echange',           '2026-11-15 21:10:00+01', '{"echange_id": 1}')
) AS e(type, quand, details)
JOIN compte c ON c.pseudo = 'demo_persee';

INSERT INTO journal_evenement (compte_id, type, horodatage, adresse_ip, details)
SELECT NULL, 'connexion_refusee',
       '2026-11-15 21:03:00+01'::timestamptz + (n * 4 || ' seconds')::interval,
       '203.0.113.42', jsonb_build_object('motif', 'compte_inconnu', 'pseudo_tente', 'admin' || n)
FROM generate_series(1, 12) AS n;

COMMIT;
