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

COMMIT;
