-- =====================================================================
-- Mythologia — Données de départ
-- Référentiels nécessaires au jeu : objets, classes, divinités, zones,
-- boss et quêtes. À exécuter après schema.sql.
--
-- Les codes (objets, zones, quêtes) reprennent ceux du client
-- (packages/client/src/game/data) : si le client ajoute un objet, une zone
-- ou une quête, il faut l'ajouter ici aussi, sinon la sauvegarde est refusée.
-- =====================================================================

BEGIN;

-- Objets : les 36 objets du jeu (données/items.ts du client).
-- Statistiques en JSONB : attaque, pv, armure (équipement), soin_pct (boissons et potions).
INSERT INTO objet (code, nom, description, categorie, emplacement, rarete, empilable, prix, statistiques) VALUES
    ('epee_bronze', 'Épée de bronze', 'Arme courte des hoplites.', 'arme', 'arme', 'commun', FALSE, 93, '{"attaque": 4}'),
    ('arc_olivier', 'Arc en bois d''olivier', 'Arc souple taillé dans les bosquets sacrés.', 'arme', 'arme', 'commun', FALSE, 93, '{"attaque": 4}'),
    ('baton_oracle', 'Bâton de l''oracle', 'Canalise les braises et les sorts.', 'arme', 'arme', 'commun', FALSE, 93, '{"attaque": 5}'),
    ('dagues_jumelles', 'Dagues jumelles', 'Lames courbes rapides et légères.', 'arme', 'arme', 'commun', FALSE, 93, '{"attaque": 5}'),
    ('sandales_cuir', 'Sandales de cuir', 'Chaussures de marche renforcées des éclaireurs.', 'armure', 'pieds', 'commun', FALSE, 89, '{"pv": 22, "armure": 3}'),
    ('arme_airain', 'Arme forgée d''airain', 'Ouvrage renforcé par Damon, équilibré pour le combat.', 'arme', 'arme', 'rare', FALSE, 241, '{"attaque": 10}'),
    ('lance_centaure', 'Lance de centaure', 'Hampe longue taillée dans le frêne des montagnes.', 'arme', 'arme', 'rare', FALSE, 324, '{"attaque": 12}'),
    ('cuirasse_hoplite', 'Cuirasse d''hoplite', 'Plastron en bronze battu résistant aux griffes et flèches.', 'armure', 'torse', 'rare', FALSE, 296, '{"attaque": 2, "pv": 32, "armure": 5}'),
    ('bouclier_hoplite', 'Bouclier d''hoplite', 'Bouclier rond en bronze renforcé par Damon.', 'armure', 'bouclier', 'rare', FALSE, 222, '{"attaque": 2, "pv": 20, "armure": 5}'),
    ('casque_corinthien', 'Casque corinthien', 'Heaume de bronze à crête cramoisie.', 'armure', 'tete', 'rare', FALSE, 278, '{"attaque": 3, "pv": 24, "armure": 4}'),
    ('lame_promethee', 'Arme trempée dans la Braise', 'Imprégnée du Cœur de Braise, fend le marbre divin.', 'arme', 'arme', 'epique', FALSE, 555, '{"attaque": 11}'),
    ('arc_artemis', 'Arc d''argent lunaire', 'Arme svelte dont la corde vibre comme un croissant de lune.', 'arme', 'arme', 'epique', FALSE, 666, '{"attaque": 13}'),
    ('tunique_brumes', 'Cuirasse des Brumes', 'Armure légère forgée dans les galeries crétoises.', 'armure', 'torse', 'epique', FALSE, 629, '{"attaque": 4, "pv": 48, "armure": 8}'),
    ('anneau_olympe', 'Anneau d''orichalque', 'Bague antique gravée de runes solaires.', 'artefact', 'anneau', 'epique', FALSE, 537, '{"attaque": 5, "pv": 22, "armure": 3}'),
    ('labrys_minotaure', 'Labrys du Minotaure', 'Double hache légendaire arrachée au maître du Labyrinthe.', 'arme', 'arme', 'legendaire', FALSE, 1388, '{"attaque": 19, "pv": 18}'),
    ('egide_egee', 'Égide d''Égée', 'Armure bénie par les profondeurs marines.', 'armure', 'torse', 'legendaire', FALSE, 1332, '{"attaque": 6, "pv": 75, "armure": 12}'),
    ('talisman_titans', 'Talisman des Titans', 'Relique rarissime forgée avant le règne de Zeus.', 'artefact', 'relique', 'legendaire', FALSE, 1480, '{"attaque": 10, "pv": 48, "armure": 5}'),
    ('potion_ambroisie', 'Potion d''ambroisie', 'Rend 38% des PV maximum.', 'consommable', NULL, 'commun', TRUE, 28, '{"soin_pct": 38}'),
    ('vin_chios', 'Vin de Chios', 'Vin rouge miellé servi à la taverne.', 'consommable', NULL, 'commun', TRUE, 33, '{"soin_pct": 35}'),
    ('posca', 'Posca des Hoplites', 'Breuvage frais au vinaigre de vin et herbes.', 'consommable', NULL, 'commun', TRUE, 44, '{"soin_pct": 45}'),
    ('hydromel_olympe', 'Hydromel d''Attique', 'Miel fermenté parfumé au thym des collines.', 'consommable', NULL, 'rare', TRUE, 67, '{"soin_pct": 60}'),
    ('kykeon', 'Kykèon d''Éleusis', 'Boisson sacrée à l’orge, au miel et à la menthe.', 'consommable', NULL, 'rare', TRUE, 89, '{"soin_pct": 80}'),
    ('nectar_divin', 'Nectar divin', 'Restaure tous les PV.', 'consommable', NULL, 'rare', TRUE, 102, '{"soin_pct": 100}'),
    ('fragment_bronze', 'Fragment de bronze', 'Débris d''armes récupérés dans les ruines.', 'ressource', NULL, 'commun', TRUE, 22, '{}'),
    ('herbe_ambroisie', 'Herbe d''ambroisie', 'Plante dorée poussant près des oliviers.', 'ressource', NULL, 'commun', TRUE, 19, '{}'),
    ('corne_satyre', 'Corne de satyre', 'Trophée robuste pris aux satyres des plaines.', 'ressource', NULL, 'commun', TRUE, 33, '{}'),
    ('plume_harpie', 'Plume de harpie', 'Plume acérée aux reflets de tempête.', 'ressource', NULL, 'commun', TRUE, 41, '{}'),
    ('ossement_ancien', 'Ossement gravé', 'Vestige runique des anciens gardes du Labyrinthe.', 'ressource', NULL, 'commun', TRUE, 48, '{}'),
    ('ecaille_vipere', 'Écaille de Lerne', 'Écaille verdâtre imprégnée des brumes du marais.', 'ressource', NULL, 'commun', TRUE, 52, '{}'),
    ('rouage_hephaistos', 'Rouage d''Héphaïstos', 'Mécanisme de bronze encore tiède.', 'ressource', NULL, 'rare', TRUE, 139, '{}'),
    ('croc_hydre', 'Croc d''Hydre', 'Croc venimeux capable de percer le bronze.', 'ressource', NULL, 'rare', TRUE, 176, '{}'),
    ('eclat_foudre', 'Éclat de foudre', 'Fragment cristallisé laissé par un éclair olympien.', 'ressource', NULL, 'epique', TRUE, 333, '{}'),
    ('coeur_braise', 'Cœur de Braise', 'Fragment incandescent arraché au Gardien d''Airain.', 'artefact', 'relique', 'rare', FALSE, 0, '{"attaque": 4, "pv": 18}'),
    ('coeur_airain', 'Cœur d''Airain', 'Relique forgée des Titans arrachée au Minotaure des Brumes.', 'artefact', 'relique', 'epique', FALSE, 0, '{"attaque": 6, "pv": 34, "armure": 4}'),
    ('vestige_egee', 'Vestige d''Égée', 'Premier Vestige Primordial, pris à la Sentinelle de Poséidon.', 'artefact', 'relique', 'epique', FALSE, 0, '{"attaque": 5, "pv": 28, "armure": 4}'),
    ('venin_orque', 'Venin d''Orque', 'Essence primordiale scellée par l''Hydre de Lerne.', 'artefact', 'relique', 'epique', FALSE, 0, '{"attaque": 8, "pv": 32}');

-- Classes : les rôles classiques d'un MMORPG, sans soigneur
-- (tous les personnages disposent de sorts de soin). Valeurs du client (classes.ts).
INSERT INTO classe (code, nom, description, pv_base, attaque_base, arme_depart_code) VALUES
    ('GUERRIER', 'Guerrier', 'Combattant au corps à corps, encaisse les coups en première ligne.', 105, 14, 'epee_bronze'),
    ('ARCHER',   'Archer',   'Attaque à distance avec précision, rapide et mobile.',              100, 16, 'arc_olivier'),
    ('MAGE',     'Mage',     'Lance des sorts puissants à distance, mais reste fragile.',          85, 20, 'baton_oracle'),
    ('ASSASSIN', 'Assassin', 'Frappe vite et fort par surprise, esquive plutôt que d''encaisser.', 78, 21, 'dagues_jumelles');

-- Divinités : bénédiction choisie à la création du personnage.
-- Les attaques spéciales sont provisoires, en attendant les règles de combat.
INSERT INTO divinite (code, nom, titre, royaume, bonus_passif, attaque_speciale) VALUES
    ('ZEUS',     'Zeus',     'Roi de l''Olympe',       'olympus',  '+15% Vitesse',          'Foudre de l''Olympe'),
    ('POSEIDON', 'Poséidon', 'Souverain des Océans',   'olympus',  '+20% Résistance',       'Raz-de-marée'),
    ('HADES',    'Hadès',    'Seigneur des Enfers',    'tartarus', '+10% Dégâts d''ombre',  'Étreinte des ombres'),
    ('ATHENA',   'Athéna',   'Déesse de la Sagesse',   'elysium',  '+15% Parade',           'Égide protectrice'),
    ('ARES',     'Arès',     'Dieu de la Guerre',      'tartarus', '+25% Force brute',      'Rage du champ de bataille'),
    ('APOLLO',   'Apollon',  'Dieu de la Lumière',     'elysium',  '+15% Portée',           'Flèche solaire');

-- Zones : les 9 zones du client (zones.ts), puis les zones de fin de jeu
-- gardées par les boss divins (prévues, pas encore dessinées dans le client).
INSERT INTO zone (code, nom, royaume, niveau_min, zone_sure, mode_vue) VALUES
    ('agora',                    'Cité de l''Agora',         'olympus',  1, TRUE,  'top-down'),
    ('plaines',                  'Plaines Foudroyées',       'olympus',  1, FALSE, 'top-down'),
    ('sanctuaire',               'Sanctuaire Brisé',         'elysium',  4, FALSE, 'top-down'),
    ('rivage',                   'Rivage d''Égée',           'olympus',  6, FALSE, 'side-view'),
    ('labyrinthe',               'Labyrinthe des Brumes',    'elysium',  7, FALSE, 'top-down'),
    ('marecages',                'Marécages de Lerne',       'elysium',  7, FALSE, 'top-down'),
    ('taverne_interieur',        'Taverne des Héros',        'olympus',  1, TRUE,  'top-down'),
    ('forge_interieur',          'Atelier de la Forge',      'olympus',  1, TRUE,  'top-down'),
    ('apothicairerie_interieur', 'Infirmerie de Cassandre',  'olympus',  1, TRUE,  'top-down'),
    -- Fin de jeu
    ('temple_athena',            'Temple d''Athéna',         'elysium',  12, FALSE, 'top-down'),
    ('delphes',                  'Sanctuaire de Delphes',    'elysium',  15, FALSE, 'top-down'),
    ('abysses_egee',             'Abysses d''Égée',          'olympus',  20, FALSE, 'side-view'),
    ('sommet_olympe',            'Sommet de l''Olympe',      'olympus',  25, FALSE, 'top-down'),
    ('portes_enfers',            'Portes des Enfers',        'tartarus', 30, FALSE, 'top-down'),
    ('champ_ares',               'Champ de bataille d''Arès', 'tartarus', 35, FALSE, 'top-down');

-- Boss divins de fin de jeu : chacun garde une zone.
-- (Les boss actuels du client — Minotaure, Hydre... — sont des monstres de
-- zone : leur victoire est enregistrée dans personnage.progression.)
INSERT INTO boss (code, divinite_code, zone_id, nom, titre, niveau)
SELECT b.code, b.divinite_code, z.id, b.nom, b.titre, b.niveau
FROM (VALUES
    ('BOSS_ATHENA',   'ATHENA',   'temple_athena', 'Athéna',   'La Stratège invaincue',  12),
    ('BOSS_APOLLO',   'APOLLO',   'delphes',       'Apollon',  'L''Archer du soleil',    18),
    ('BOSS_POSEIDON', 'POSEIDON', 'abysses_egee',  'Poséidon', 'Le Seigneur des flots',  22),
    ('BOSS_ZEUS',     'ZEUS',     'sommet_olympe', 'Zeus',     'Le Tonnerre courroucé',  28),
    ('BOSS_HADES',    'HADES',    'portes_enfers', 'Hadès',    'Le Gardien des âmes',    32),
    ('BOSS_ARES',     'ARES',     'champ_ares',    'Arès',     'La Furie sans fin',      38)
) AS b(code, divinite_code, zone_code, nom, titre, niveau)
JOIN zone z ON z.code = b.zone_code;

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

-- Quêtes : les 12 quêtes du client (story.ts), objectifs en JSONB.
INSERT INTO quete (id, titre, type, niveau_conseille, recompense_xp, recompense_or, etapes) VALUES
    ('mq_1_etincelle', 'L''Étincelle dans les Cendres', 'principale', 1, 90, 15,
     '[{"id": "light_brasero", "type": "interact", "targetId": "brasero_promethee", "required": 1, "label": "Ranimer le Brasero de Prométhée"}]'),
    ('mq_2_terres_foudroyees', 'Les Terres Foudroyées', 'principale', 2, 185, 30,
     '[{"id": "kill_satyres", "type": "kill", "targetId": "satyre", "required": 3, "label": "Satyres vaincus"}, {"id": "kill_harpies", "type": "kill", "targetId": "harpie", "required": 2, "label": "Harpies vaincues"}, {"id": "read_stele", "type": "interact", "targetId": "stele_chatiment", "required": 1, "label": "Stèle du Châtiment"}]'),
    ('mq_3_sanctuaire', 'Le Seuil des Vestiges', 'principale', 4, 280, 48,
     '[{"id": "enter_sanctuaire", "type": "enter_zone", "targetId": "sanctuaire", "required": 1, "label": "Entrer dans le Sanctuaire Brisé"}, {"id": "kill_automates", "type": "kill", "targetId": "automate", "required": 2, "label": "Automates détruits"}, {"id": "kill_gardien", "type": "kill", "targetId": "gardien_airain", "required": 1, "label": "Vaincre le Gardien d''Airain"}]'),
    ('mq_4_rivage_epreuve', 'L''Épreuve du Rivage Brisé', 'principale', 6, 450, 83,
     '[{"id": "activate_steles", "type": "interact", "targetId": "stele_rivage", "required": 3, "label": "Stèles de Prométhée activées"}, {"id": "kill_sentinel", "type": "kill", "targetId": "sentinelle_poseidon", "required": 1, "label": "Sentinelle de Poséidon vaincue"}]'),
    ('mq_5_labyrinthe', 'Le Labyrinthe des Brumes', 'principale', 7, 620, 122,
     '[{"id": "enter_laby", "type": "enter_zone", "targetId": "labyrinthe", "required": 1, "label": "Entrer dans le Labyrinthe des Brumes"}, {"id": "find_ariane", "type": "interact", "targetId": "fil_ariane", "required": 1, "label": "Allumer l''autel du Fil d''Ariane"}, {"id": "kill_minotaure", "type": "kill", "targetId": "minotaure", "required": 1, "label": "Minotaure des Brumes vaincu"}]'),
    ('mq_6_hydre', 'Les Marécages de Lerne', 'principale', 9, 760, 147,
     '[{"id": "enter_marecages", "type": "enter_zone", "targetId": "marecages", "required": 1, "label": "Entrer dans les Marécages de Lerne"}, {"id": "purge_soufre", "type": "interact", "targetId": "autel_soufre", "required": 2, "label": "Purger les Autels de Soufre"}, {"id": "kill_hydre", "type": "kill", "targetId": "hydre_lerne", "required": 1, "label": "Hydre de Lerne vaincue"}]'),
    ('sq_initiation_artisanat', 'Les Ateliers de la Cité', 'secondaire', 1, 120, 24,
     '[{"id": "visit_forge", "type": "enter_zone", "targetId": "forge_interieur", "required": 1, "label": "Entrer dans l''Atelier de la Forge"}, {"id": "visit_apoth", "type": "enter_zone", "targetId": "apothicairerie_interieur", "required": 1, "label": "Entrer dans l''Infirmerie de Cassandre"}]'),
    ('sq_bronze_ruines', 'Le Bronze des Ruines', 'secondaire', 1, 120, 26,
     '[{"id": "collect_bronze", "type": "interact", "targetId": "fragment_bronze", "required": 3, "label": "Fragments de bronze"}]'),
    ('sq_ambroisie_perdue', 'L''Ambroisie Perdue', 'secondaire', 1, 105, 19,
     '[{"id": "collect_herbs", "type": "interact", "targetId": "herbe_ambroisie", "required": 3, "label": "Herbes d''ambroisie"}]'),
    ('sq_ailes_tempete', 'Les Ailes de la Tempête', 'secondaire', 2, 145, 42,
     '[{"id": "kill_harpies_side", "type": "kill", "targetId": "harpie", "required": 4, "label": "Harpies des tempêtes"}]'),
    ('sq_portes_chaos', 'Aux Portes du Chaos', 'secondaire', 3, 175, 37,
     '[{"id": "kill_centaure", "type": "kill", "targetId": "centaure", "required": 1, "label": "Centaure corrompu"}]'),
    ('sq_chasse_squelettes', 'Les Légions du Labyrinthe', 'secondaire', 7, 260, 53,
     '[{"id": "kill_squelettes", "type": "kill", "targetId": "squelette", "required": 5, "label": "Squelettes hoplites vaincus"}]');

-- Chaîne de quêtes (« prérequis » du client) :
--   mq_1 -> mq_2 -> mq_3 -> mq_4 -> mq_5 -> mq_6   (histoire principale)
--   mq_1 -> sq_portes_chaos     mq_3 -> sq_chasse_squelettes   (quêtes secondaires)
INSERT INTO quete_prerequis (quete_id, prerequis_id) VALUES
    ('mq_2_terres_foudroyees', 'mq_1_etincelle'),
    ('mq_3_sanctuaire', 'mq_2_terres_foudroyees'),
    ('mq_4_rivage_epreuve', 'mq_3_sanctuaire'),
    ('mq_5_labyrinthe', 'mq_4_rivage_epreuve'),
    ('mq_6_hydre', 'mq_5_labyrinthe'),
    ('sq_portes_chaos', 'mq_1_etincelle'),
    ('sq_chasse_squelettes', 'mq_3_sanctuaire');

COMMIT;
