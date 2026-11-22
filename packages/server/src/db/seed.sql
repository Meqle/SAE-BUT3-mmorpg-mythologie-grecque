-- =====================================================================
-- Mythologia — Données de départ
-- Référentiels nécessaires au jeu : classes, divinités, zones, boss, objets.
-- À exécuter après schema.sql.
-- =====================================================================

BEGIN;

-- Classes : les rôles classiques d'un MMORPG, sans soigneur
-- (tous les personnages disposent de sorts de soin).
INSERT INTO classe (code, nom, description, pv_base, attaque_base) VALUES
    ('GUERRIER', 'Guerrier', 'Combattant au corps à corps, encaisse les coups en première ligne.', 150, 12),
    ('ARCHER',   'Archer',   'Attaque à distance avec précision, rapide et mobile.',              100, 15),
    ('MAGE',     'Mage',     'Lance des sorts puissants à distance, mais reste fragile.',          80, 18),
    ('ASSASSIN', 'Assassin', 'Frappe vite et fort par surprise, esquive plutôt que d''encaisser.', 95, 20);

-- Divinités : bénédiction choisie à la création du personnage.
-- Les attaques spéciales sont provisoires, en attendant les règles de combat.
INSERT INTO divinite (code, nom, titre, royaume, bonus_passif, attaque_speciale) VALUES
    ('ZEUS',     'Zeus',     'Roi de l''Olympe',       'olympus',  '+15% Vitesse',          'Foudre de l''Olympe'),
    ('POSEIDON', 'Poséidon', 'Souverain des Océans',   'olympus',  '+20% Résistance',       'Raz-de-marée'),
    ('HADES',    'Hadès',    'Seigneur des Enfers',    'tartarus', '+10% Dégâts d''ombre',  'Étreinte des ombres'),
    ('ATHENA',   'Athéna',   'Déesse de la Sagesse',   'elysium',  '+15% Parade',           'Égide protectrice'),
    ('ARES',     'Arès',     'Dieu de la Guerre',      'tartarus', '+25% Force brute',      'Rage du champ de bataille'),
    ('APOLLO',   'Apollon',  'Dieu de la Lumière',     'elysium',  '+15% Portée',           'Flèche solaire');

-- Zones : une zone de départ, puis une zone gardée par chaque boss divin.
INSERT INTO zone (nom, royaume, niveau_min) VALUES
    ('Agora de l''Olympe',     'olympus',  1),
    ('Sommet de l''Olympe',    'olympus',  25),
    ('Rivage d''Égée',         'olympus',  20),
    ('Temple d''Athéna',       'elysium',  10),
    ('Sanctuaire de Delphes',  'elysium',  15),
    ('Portes des Enfers',      'tartarus', 30),
    ('Champ de bataille d''Arès', 'tartarus', 35);

-- Boss divins : chacun garde une zone.
INSERT INTO boss (code, divinite_code, zone_id, nom, titre, niveau)
SELECT b.code, b.divinite_code, z.id, b.nom, b.titre, b.niveau
FROM (VALUES
    ('BOSS_ATHENA',   'ATHENA',   'Temple d''Athéna',          'Athéna',   'La Stratège invaincue',  12),
    ('BOSS_APOLLO',   'APOLLO',   'Sanctuaire de Delphes',     'Apollon',  'L''Archer du soleil',    18),
    ('BOSS_POSEIDON', 'POSEIDON', 'Rivage d''Égée',            'Poséidon', 'Le Seigneur des flots',  22),
    ('BOSS_ZEUS',     'ZEUS',     'Sommet de l''Olympe',       'Zeus',     'Le Tonnerre courroucé',  28),
    ('BOSS_HADES',    'HADES',    'Portes des Enfers',         'Hadès',    'Le Gardien des âmes',    32),
    ('BOSS_ARES',     'ARES',     'Champ de bataille d''Arès', 'Arès',     'La Furie sans fin',      38)
) AS b(code, divinite_code, zone_nom, nom, titre, niveau)
JOIN zone z ON z.nom = b.zone_nom;

-- Objets de base (le détail des statistiques ira dans MongoDB).
INSERT INTO objet (nom, description, categorie, rarete, empilable, prix) VALUES
    ('Épée de bronze',     'Arme de base des hoplites.',                       'arme',        'commun',     FALSE,  50),
    ('Arc en bois d''olivier', 'Arc souple et léger.',                         'arme',        'commun',     FALSE,  50),
    ('Bâton de l''oracle', 'Canalise les sorts des mages.',                    'arme',        'commun',     FALSE,  50),
    ('Dagues jumelles',    'Deux lames rapides pour les assassins.',          'arme',        'commun',     FALSE,  50),
    ('Bouclier d''hoplite', 'Bouclier rond en bronze.',                        'armure',      'rare',       FALSE, 120),
    ('Potion d''ambroisie', 'Rend une partie des points de vie.',              'consommable', 'commun',     TRUE,   10),
    ('Nectar divin',       'Rend tous les points de vie de l''équipe.',        'consommable', 'rare',       TRUE,   60),
    ('Éclat de foudre',    'Fragment laissé par Zeus, sert à l''artisanat.',   'ressource',   'epique',     TRUE,  200),
    ('Toison d''or',       'Artefact légendaire convoité par tous les héros.', 'artefact',    'legendaire', FALSE, 5000);

-- Statistiques des objets (JSONB) : chaque objet a les siennes.
UPDATE objet o SET statistiques = s.stats::jsonb
FROM (VALUES
    ('Épée de bronze',         '{"attaque": 8}'),
    ('Arc en bois d''olivier', '{"attaque": 7, "portee": 5}'),
    ('Bâton de l''oracle',     '{"puissance_magique": 9}'),
    ('Dagues jumelles',        '{"attaque": 6, "vitesse": 3}'),
    ('Bouclier d''hoplite',    '{"defense": 10, "parade": 5}'),
    ('Potion d''ambroisie',    '{"soin_pv": 40}'),
    ('Nectar divin',           '{"soin_pv": 100, "cible": "equipe"}'),
    ('Toison d''or',           '{"bonus_xp_pct": 20}')
) AS s(nom, stats)
WHERE o.nom = s.nom;

-- Phases de combat des boss (JSONB) : provisoires, en attendant les règles de combat.
UPDATE boss b SET phases = p.phases::jsonb
FROM (VALUES
    ('BOSS_ATHENA',   '[{"phase": 1, "seuil_pv_pct": 100, "attaques": ["Coup de lance"]},
                        {"phase": 2, "seuil_pv_pct": 50,  "attaques": ["Coup de lance", "Égide protectrice"]}]'),
    ('BOSS_APOLLO',   '[{"phase": 1, "seuil_pv_pct": 100, "attaques": ["Flèche solaire"]},
                        {"phase": 2, "seuil_pv_pct": 40,  "attaques": ["Pluie de flèches", "Aveuglement"]}]'),
    ('BOSS_POSEIDON', '[{"phase": 1, "seuil_pv_pct": 100, "attaques": ["Coup de trident"]},
                        {"phase": 2, "seuil_pv_pct": 60,  "attaques": ["Raz-de-marée"]},
                        {"phase": 3, "seuil_pv_pct": 25,  "attaques": ["Raz-de-marée", "Séisme"]}]'),
    ('BOSS_ZEUS',     '[{"phase": 1, "seuil_pv_pct": 100, "attaques": ["Éclair"]},
                        {"phase": 2, "seuil_pv_pct": 60,  "attaques": ["Foudre de l''Olympe"]},
                        {"phase": 3, "seuil_pv_pct": 20,  "attaques": ["Foudre de l''Olympe", "Tempête céleste"]}]'),
    ('BOSS_HADES',    '[{"phase": 1, "seuil_pv_pct": 100, "attaques": ["Étreinte des ombres"]},
                        {"phase": 2, "seuil_pv_pct": 50,  "attaques": ["Invocation des âmes"]}]'),
    ('BOSS_ARES',     '[{"phase": 1, "seuil_pv_pct": 100, "attaques": ["Charge brutale"]},
                        {"phase": 2, "seuil_pv_pct": 30,  "attaques": ["Rage du champ de bataille"]}]')
) AS p(code, phases)
WHERE b.code = p.code;

-- Quêtes (étapes en JSONB) puis chaîne de prérequis :
--   tutoriel_agora -> offrande_athena -> epreuve_athena ─┐
--                                     -> oracle_delphes -> colere_poseidon -> descente_enfers
--   (descente_enfers demande à la fois epreuve_athena et colere_poseidon)
INSERT INTO quete (id, titre, niveau_requis, recompense_xp, etapes) VALUES
    ('tutoriel_agora',  'Premiers pas sur l''Agora', 1, 50,
     '[{"type": "dialogue", "pnj": "Hermès"}, {"type": "deplacement", "zone": "Agora de l''Olympe"}]'),
    ('offrande_athena', 'Une offrande pour Athéna', 5, 150,
     '[{"type": "collecte", "objet": "Potion d''ambroisie", "quantite": 3}, {"type": "dialogue", "pnj": "Prêtresse d''Athéna"}]'),
    ('epreuve_athena',  'L''épreuve d''Athéna', 12, 400,
     '[{"type": "deplacement", "zone": "Temple d''Athéna"}, {"type": "combat", "boss": "BOSS_ATHENA"}]'),
    ('oracle_delphes',  'L''oracle de Delphes', 12, 300,
     '[{"type": "deplacement", "zone": "Sanctuaire de Delphes"}, {"type": "dialogue", "pnj": "La Pythie"}]'),
    ('colere_poseidon', 'La colère de Poséidon', 20, 600,
     '[{"type": "deplacement", "zone": "Rivage d''Égée"}, {"type": "combat", "boss": "BOSS_POSEIDON"}]'),
    ('descente_enfers', 'Descente aux Enfers', 30, 1000,
     '[{"type": "deplacement", "zone": "Portes des Enfers"}, {"type": "dialogue", "pnj": "Charon"}, {"type": "combat", "boss": "BOSS_HADES"}]');

INSERT INTO quete_prerequis (quete_id, prerequis_id) VALUES
    ('offrande_athena', 'tutoriel_agora'),
    ('epreuve_athena',  'offrande_athena'),
    ('oracle_delphes',  'offrande_athena'),
    ('colere_poseidon', 'oracle_delphes'),
    ('descente_enfers', 'colere_poseidon'),
    ('descente_enfers', 'epreuve_athena');

COMMIT;
