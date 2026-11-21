-- =====================================================================
-- Mythologia — Schéma PostgreSQL
-- Pôle Base de données
--
-- Ce script crée les 21 tables du jeu, avec leurs contraintes.
-- Principe : les règles importantes du jeu sont vérifiées PAR LA BASE
-- (CHECK, UNIQUE, clés étrangères, triggers). Même si le serveur a un
-- bug, la base refuse une donnée incohérente.
--
-- Architecture retenue : PostgreSQL (données durables) + Redis (temps réel).
-- PostgreSQL reprend aussi ce qui était prévu dans d'autres bases :
--   - documents souples (ex-MongoDB)      -> colonnes JSONB + index GIN
--   - relations amis / chaînes de quêtes (ex-Neo4j) -> requêtes récursives
--   - journal des événements (ex-Elasticsearch)     -> table journal_evenement
--
-- Ordre d'exécution : schema.sql -> seed.sql -> demo.sql (optionnel)
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Référentiels du jeu (remplis par seed.sql, rarement modifiés)
-- ---------------------------------------------------------------------

-- Les codes (classe.code, zone.code, objet.code, quete.id) sont les MÊMES
-- identifiants que ceux du client (packages/client/src/game/data) : la
-- sauvegarde envoyée par le jeu se range directement dans ces tables.

-- Modèle d'objet : "l'épée de bronze" en général.
CREATE TABLE objet (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code         TEXT    NOT NULL UNIQUE,            -- ex. 'epee_bronze', identifiant du client
    nom          TEXT    NOT NULL UNIQUE,
    description  TEXT    NOT NULL DEFAULT '',
    categorie    TEXT    NOT NULL
                 CHECK (categorie IN ('arme','armure','consommable','artefact','ressource')),
    -- Emplacement où l'objet s'équipe ; vide pour un objet qui ne s'équipe pas (potion, ressource)
    emplacement  TEXT    CHECK (emplacement IN ('arme','tete','torse','bouclier','pieds','anneau','relique')),
    rarete       TEXT    NOT NULL DEFAULT 'commun'
                 CHECK (rarete IN ('commun','rare','epique','legendaire','divin')),
    empilable    BOOLEAN NOT NULL DEFAULT FALSE,     -- les potions s'empilent, les épées non
    prix         INTEGER NOT NULL DEFAULT 0 CHECK (prix >= 0),
    -- Statistiques propres à chaque objet (une épée a une attaque, une potion
    -- un soin...) : document JSONB. Ex. {"attaque": 4} ou {"soin_pct": 38}
    statistiques JSONB   NOT NULL DEFAULT '{}',
    CONSTRAINT objet_code_format CHECK (code ~ '^[a-z0-9_]+$'),
    CONSTRAINT objet_statistiques_objet CHECK (jsonb_typeof(statistiques) = 'object')
);
-- Index GIN : permet de chercher DANS le JSON (opérateur @>) sans tout parcourir.
CREATE INDEX objet_statistiques_gin ON objet USING GIN (statistiques jsonb_path_ops);

-- Classe du personnage : son style de combat.
-- Pas de classe de soin : tous les personnages ont des sorts de soin.
CREATE TABLE classe (
    id                SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code              TEXT     NOT NULL UNIQUE,          -- ex. 'GUERRIER', utilisé côté TypeScript
    nom               TEXT     NOT NULL UNIQUE,
    description       TEXT     NOT NULL DEFAULT '',
    pv_base           INTEGER  NOT NULL CHECK (pv_base > 0),
    attaque_base      INTEGER  NOT NULL CHECK (attaque_base >= 0),
    -- Arme donnée à la création du personnage
    arme_depart_code  TEXT     NOT NULL REFERENCES objet(code),
    CONSTRAINT classe_code_format CHECK (code ~ '^[A-Z_]+$')
);

-- Divinité : sa bénédiction est choisie à la création du personnage
-- et lui donne une attaque spéciale. Chaque divinité est aussi un boss.
-- Les codes correspondent au type GodAffinity de packages/shared.
CREATE TABLE divinite (
    code              TEXT PRIMARY KEY
                      CHECK (code IN ('ZEUS','POSEIDON','HADES','ATHENA','ARES','APOLLO')),
    nom               TEXT NOT NULL UNIQUE,
    titre             TEXT NOT NULL,
    royaume           TEXT NOT NULL CHECK (royaume IN ('olympus','elysium','tartarus')),
    bonus_passif      TEXT NOT NULL,
    attaque_speciale  TEXT NOT NULL                   -- nom de l'attaque accordée par la bénédiction
);

-- Zone du monde, rattachée à l'un des trois royaumes.
CREATE TABLE zone (
    id          SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code        TEXT     NOT NULL UNIQUE,            -- ex. 'agora', identifiant du client (ZoneId)
    nom         TEXT     NOT NULL UNIQUE,
    royaume     TEXT     NOT NULL CHECK (royaume IN ('olympus','elysium','tartarus')),
    niveau_min  SMALLINT NOT NULL DEFAULT 1 CHECK (niveau_min BETWEEN 1 AND 100),
    zone_sure   BOOLEAN  NOT NULL DEFAULT FALSE,     -- pas de monstres (cité, intérieurs)
    mode_vue    TEXT     NOT NULL DEFAULT 'top-down' CHECK (mode_vue IN ('top-down','side-view')),
    CONSTRAINT zone_code_format CHECK (code ~ '^[a-z_]+$')
);

-- Boss divin : chaque divinité garde une zone (au plus un boss par zone).
CREATE TABLE boss (
    code           TEXT     PRIMARY KEY,
    divinite_code  TEXT     NOT NULL UNIQUE REFERENCES divinite(code),
    zone_id        SMALLINT NOT NULL UNIQUE REFERENCES zone(id),
    nom            TEXT     NOT NULL,
    titre          TEXT     NOT NULL,
    niveau         SMALLINT NOT NULL CHECK (niveau BETWEEN 1 AND 100),
    -- Déroulé du combat : chaque boss a ses propres phases et attaques,
    -- donc une structure souple (JSONB) plutôt que des colonnes fixes.
    -- Ex. [{"phase": 1, "seuil_pv_pct": 100, "attaques": ["…"]}, …]
    phases         JSONB    NOT NULL DEFAULT '[]',
    CONSTRAINT boss_phases_tableau CHECK (jsonb_typeof(phases) = 'array')
);

-- Quête : ses objectifs sont un document JSONB (chaque quête a les siens).
CREATE TABLE quete (
    id                TEXT     PRIMARY KEY,                 -- ex. 'mq_1_etincelle', identifiant du client
    titre             TEXT     NOT NULL UNIQUE,
    type              TEXT     NOT NULL DEFAULT 'principale' CHECK (type IN ('principale','secondaire')),
    -- Niveau conseillé : le jeu ne bloque pas une quête selon le niveau,
    -- la base ne le fait donc pas non plus (seuls les prérequis sont imposés).
    niveau_conseille  SMALLINT NOT NULL DEFAULT 1 CHECK (niveau_conseille BETWEEN 1 AND 100),
    recompense_xp     INTEGER  NOT NULL DEFAULT 0 CHECK (recompense_xp >= 0),
    recompense_or     INTEGER  NOT NULL DEFAULT 0 CHECK (recompense_or >= 0),
    -- Objectifs, au format du client. Ex. [{"id": "kill_satyres", "type": "kill",
    --   "targetId": "satyre", "required": 3, "label": "Satyres vaincus"}]
    etapes            JSONB    NOT NULL DEFAULT '[]',
    CONSTRAINT quete_id_format CHECK (id ~ '^[a-z0-9_]+$'),
    CONSTRAINT quete_etapes_tableau CHECK (jsonb_typeof(etapes) = 'array')
);
CREATE INDEX quete_etapes_gin ON quete USING GIN (etapes jsonb_path_ops);

-- Chaîne de quêtes (association réflexive DÉBLOQUE) :
-- la quête prerequis_id doit être terminée avant de commencer quete_id.
CREATE TABLE quete_prerequis (
    quete_id      TEXT NOT NULL REFERENCES quete(id) ON DELETE CASCADE,
    prerequis_id  TEXT NOT NULL REFERENCES quete(id) ON DELETE CASCADE,
    PRIMARY KEY (quete_id, prerequis_id),
    CONSTRAINT quete_pas_son_propre_prerequis CHECK (quete_id <> prerequis_id)
);
CREATE INDEX quete_prerequis_prerequis_idx ON quete_prerequis (prerequis_id);

-- Interdit les boucles (A débloque B, B débloque A) : sinon plus personne ne
-- pourrait commencer ces quêtes. On remonte récursivement tous les prérequis
-- du prérequis ajouté : si on y retrouve la quête elle-même, c'est une boucle.
CREATE FUNCTION verifier_cycle_quete() RETURNS trigger AS $$
BEGIN
    IF EXISTS (
        WITH RECURSIVE ancetres AS (
            SELECT prerequis_id FROM quete_prerequis WHERE quete_id = NEW.prerequis_id
            UNION
            SELECT qp.prerequis_id
              FROM quete_prerequis qp
              JOIN ancetres a ON qp.quete_id = a.prerequis_id
        )
        SELECT 1 FROM ancetres WHERE prerequis_id = NEW.quete_id
    ) THEN
        RAISE EXCEPTION 'Boucle de prérequis : % dépend déjà de %', NEW.prerequis_id, NEW.quete_id
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quete_prerequis_sans_cycle
    BEFORE INSERT OR UPDATE ON quete_prerequis
    FOR EACH ROW EXECUTE FUNCTION verifier_cycle_quete();

-- ---------------------------------------------------------------------
-- 2. Joueurs et personnages
-- ---------------------------------------------------------------------

CREATE TABLE compte (
    id                 INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email              TEXT        NOT NULL,
    pseudo             TEXT        NOT NULL,
    mot_de_passe_hash  TEXT        NOT NULL,          -- jamais le mot de passe en clair
    role               TEXT        NOT NULL DEFAULT 'joueur'
                       CHECK (role IN ('joueur','moderateur','admin')),
    banni              BOOLEAN     NOT NULL DEFAULT FALSE,
    date_creation      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT compte_email_format CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    CONSTRAINT compte_pseudo_format CHECK (pseudo ~ '^[A-Za-z0-9_-]{3,20}$')
);
-- Unicité insensible à la casse : "Aramis" et "aramis" sont le même pseudo.
CREATE UNIQUE INDEX compte_email_unique  ON compte (lower(email));
CREATE UNIQUE INDEX compte_pseudo_unique ON compte (lower(pseudo));

CREATE TABLE personnage (
    id             INTEGER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    compte_id      INTEGER          NOT NULL REFERENCES compte(id) ON DELETE CASCADE,
    classe_id      SMALLINT         NOT NULL REFERENCES classe(id),
    divinite_code  TEXT             NOT NULL REFERENCES divinite(code),  -- bénédiction divine
    zone_id        SMALLINT         NOT NULL REFERENCES zone(id),
    nom            TEXT             NOT NULL,
    niveau         SMALLINT         NOT NULL DEFAULT 1 CHECK (niveau BETWEEN 1 AND 100),
    experience     INTEGER          NOT NULL DEFAULT 0 CHECK (experience >= 0),  -- XP gagnée dans le niveau actuel
    pv             INTEGER          NOT NULL CHECK (pv >= 0),
    pv_max         INTEGER          NOT NULL CHECK (pv_max > 0),
    -- Dernière position sauvegardée. La position en direct vit dans le serveur
    -- (et plus tard dans Redis) ; elle est recopiée ici régulièrement et à la déconnexion.
    position_x     DOUBLE PRECISION NOT NULL DEFAULT 400,
    position_y     DOUBLE PRECISION NOT NULL DEFAULT 300,
    mode_vue       TEXT             NOT NULL DEFAULT 'top-down'
                   CHECK (mode_vue IN ('top-down','side-view')),
    pieces_or      INTEGER          NOT NULL DEFAULT 0 CHECK (pieces_or >= 0),     -- « drachmes » dans le jeu
    -- Progression détaillée, propre au contenu du jeu et qui change souvent :
    -- bestiaire, compétences, codex, zones découvertes, boss vaincus...
    -- Document JSONB : le client peut ajouter un champ sans modifier la base.
    -- Ex. {"defeatedBosses": ["minotaure"], "bestiaryKills": {"satyre": 12}}
    progression    JSONB            NOT NULL DEFAULT '{}',
    date_creation  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    date_sauvegarde TIMESTAMPTZ     NOT NULL DEFAULT now(),
    CONSTRAINT personnage_pv_max CHECK (pv <= pv_max),
    CONSTRAINT personnage_nom_format CHECK (nom ~ '^[A-Za-zÀ-ÿ0-9_ -]{3,20}$'),
    CONSTRAINT personnage_progression_objet CHECK (jsonb_typeof(progression) = 'object')
);
CREATE UNIQUE INDEX personnage_nom_unique ON personnage (lower(nom));
CREATE INDEX personnage_compte_idx ON personnage (compte_id);
-- Ex. « qui a vaincu le Minotaure ? » : progression @> '{"defeatedBosses": ["minotaure"]}'
CREATE INDEX personnage_progression_gin ON personnage USING GIN (progression jsonb_path_ops);

-- Règle du jeu : 5 personnages maximum par compte.
CREATE FUNCTION verifier_limite_personnages() RETURNS trigger AS $$
BEGIN
    -- Verrouille le compte pour que deux créations simultanées ne dépassent pas la limite.
    PERFORM 1 FROM compte WHERE id = NEW.compte_id FOR UPDATE;
    IF (SELECT count(*) FROM personnage WHERE compte_id = NEW.compte_id) >= 5 THEN
        RAISE EXCEPTION 'Un compte ne peut pas avoir plus de 5 personnages'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER personnage_limite
    BEFORE INSERT ON personnage
    FOR EACH ROW EXECUTE FUNCTION verifier_limite_personnages();

-- ---------------------------------------------------------------------
-- 2 bis. Social : guildes et amis
-- ---------------------------------------------------------------------

CREATE TABLE guilde (
    id             INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom            TEXT        NOT NULL,
    sigle          TEXT        NOT NULL,                  -- ex. 'ARGO', affiché à côté du pseudo
    date_creation  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT guilde_nom_format CHECK (nom ~ '^[A-Za-zÀ-ÿ0-9'' -]{3,30}$'),
    CONSTRAINT guilde_sigle_format CHECK (sigle ~ '^[A-Z]{2,5}$')
);
CREATE UNIQUE INDEX guilde_nom_unique ON guilde (lower(nom));
CREATE UNIQUE INDEX guilde_sigle_unique ON guilde (sigle);

-- Association porteuse MEMBRE DE : un personnage est dans au plus une guilde
-- (d'où personnage_id seul en clé primaire), avec un rang.
CREATE TABLE membre_guilde (
    personnage_id  INTEGER     PRIMARY KEY REFERENCES personnage(id) ON DELETE CASCADE,
    guilde_id      INTEGER     NOT NULL REFERENCES guilde(id) ON DELETE CASCADE,
    rang           TEXT        NOT NULL DEFAULT 'membre'
                   CHECK (rang IN ('chef','officier','membre')),
    date_entree    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX membre_guilde_guilde_idx ON membre_guilde (guilde_id);
-- Index unique PARTIEL : il ne s'applique qu'aux lignes où rang = 'chef'.
-- Résultat : une guilde ne peut avoir qu'un seul chef.
CREATE UNIQUE INDEX membre_guilde_un_seul_chef ON membre_guilde (guilde_id) WHERE rang = 'chef';

-- Association réflexive EST AMI DE : un personnage demande, l'autre accepte ou refuse.
CREATE TABLE amitie (
    demandeur_id     INTEGER     NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    destinataire_id  INTEGER     NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    statut           TEXT        NOT NULL DEFAULT 'en_attente'
                     CHECK (statut IN ('en_attente','acceptee','refusee')),
    date_demande     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (demandeur_id, destinataire_id),
    CONSTRAINT amitie_pas_avec_soi_meme CHECK (demandeur_id <> destinataire_id)
);
-- Une seule relation par paire, quel que soit le sens :
-- si Persée a demandé Atalante, Atalante ne peut pas créer une 2e demande vers Persée.
CREATE UNIQUE INDEX amitie_paire_unique
    ON amitie (LEAST(demandeur_id, destinataire_id), GREATEST(demandeur_id, destinataire_id));
CREATE INDEX amitie_destinataire_idx ON amitie (destinataire_id);

-- Vue pratique : chaque amitié acceptée dans les deux sens (personnage -> ami).
CREATE VIEW v_amis AS
SELECT demandeur_id AS personnage_id, destinataire_id AS ami_id FROM amitie WHERE statut = 'acceptee'
UNION ALL
SELECT destinataire_id, demandeur_id FROM amitie WHERE statut = 'acceptee';

-- ---------------------------------------------------------------------
-- 3. Activité en jeu
-- ---------------------------------------------------------------------

CREATE TABLE session_jeu (
    id             INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    personnage_id  INTEGER     NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    debut          TIMESTAMPTZ NOT NULL DEFAULT now(),
    fin            TIMESTAMPTZ,                       -- NULL tant que la session est ouverte
    adresse_ip     INET,
    CONSTRAINT session_dates CHECK (fin IS NULL OR fin >= debut)
);
CREATE INDEX session_personnage_idx ON session_jeu (personnage_id);

CREATE TABLE victoire_boss (
    id              INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    personnage_id   INTEGER     NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    boss_code       TEXT        NOT NULL REFERENCES boss(code),
    date_victoire   TIMESTAMPTZ NOT NULL DEFAULT now(),
    duree_combat_s  INTEGER     NOT NULL CHECK (duree_combat_s > 0)
);
CREATE INDEX victoire_personnage_idx ON victoire_boss (personnage_id);
CREATE INDEX victoire_boss_idx ON victoire_boss (boss_code, duree_combat_s);

CREATE TABLE classement_saison (
    id             INTEGER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    personnage_id  INTEGER  NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    saison         SMALLINT NOT NULL CHECK (saison >= 1),
    score          INTEGER  NOT NULL DEFAULT 0 CHECK (score >= 0),
    CONSTRAINT classement_unique UNIQUE (personnage_id, saison)
);

-- Le rang n'est pas stocké : il est calculé à la demande (toujours juste).
CREATE VIEW v_classement_saison AS
SELECT c.saison,
       RANK() OVER (PARTITION BY c.saison ORDER BY c.score DESC) AS rang,
       p.nom AS personnage,
       c.score
FROM classement_saison c
JOIN personnage p ON p.id = c.personnage_id;

-- Avancement des quêtes (association porteuse SUIT entre PERSONNAGE et QUETE).
-- Une quête sans ligne ici n'est pas commencée (« verrouillée » ou « disponible »).
CREATE TABLE progression_quete (
    personnage_id  INTEGER     NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    quete_id       TEXT        NOT NULL REFERENCES quete(id) ON DELETE CASCADE,
    -- en_cours = acceptée ; a_rendre = objectifs remplis, à rendre au PNJ ; terminee = récompense reçue
    statut         TEXT        NOT NULL DEFAULT 'en_cours'
                   CHECK (statut IN ('en_cours','a_rendre','terminee','abandonnee')),
    -- Compteur de chaque objectif. Ex. {"kill_satyres": 2, "kill_harpies": 0}
    compteurs      JSONB       NOT NULL DEFAULT '{}',
    date_maj       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (personnage_id, quete_id),
    CONSTRAINT progression_compteurs_objet CHECK (jsonb_typeof(compteurs) = 'object')
);
CREATE INDEX progression_quete_quete_idx ON progression_quete (quete_id);

-- Règle du jeu : pour commencer une quête, il faut avoir terminé toutes
-- ses quêtes prérequises.
CREATE FUNCTION verifier_debut_quete() RETURNS trigger AS $$
DECLARE
    v_manquante  TEXT;
BEGIN
    SELECT qp.prerequis_id INTO v_manquante
      FROM quete_prerequis qp
     WHERE qp.quete_id = NEW.quete_id
       AND NOT EXISTS (SELECT 1 FROM progression_quete pq
                        WHERE pq.personnage_id = NEW.personnage_id
                          AND pq.quete_id = qp.prerequis_id
                          AND pq.statut = 'terminee')
     LIMIT 1;
    IF v_manquante IS NOT NULL THEN
        RAISE EXCEPTION 'La quête % doit d''abord être terminée', v_manquante
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER progression_debut_quete
    BEFORE INSERT ON progression_quete
    FOR EACH ROW EXECUTE FUNCTION verifier_debut_quete();

CREATE FUNCTION maj_date_progression() RETURNS trigger AS $$
BEGIN
    NEW.date_maj := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER progression_date_maj
    BEFORE UPDATE ON progression_quete
    FOR EACH ROW EXECUTE FUNCTION maj_date_progression();

-- Journal des événements : connexions, échanges, combats...
-- Sert à repérer les tricheurs et les attaques (ex. force brute sur la connexion).
-- compte_id est vide quand le compte est inconnu (ex. pseudo inexistant).
CREATE TABLE journal_evenement (
    id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    compte_id   INTEGER     REFERENCES compte(id) ON DELETE SET NULL,
    type        TEXT        NOT NULL CHECK (type IN (
                    'inscription','connexion_reussie','connexion_refusee','deconnexion',
                    'echange','combat','victoire_boss','sanction')),
    horodatage  TIMESTAMPTZ NOT NULL DEFAULT now(),
    adresse_ip  INET,
    -- Informations propres à chaque type d'événement. Ex. {"motif": "mot_de_passe"}
    details     JSONB       NOT NULL DEFAULT '{}',
    CONSTRAINT journal_details_objet CHECK (jsonb_typeof(details) = 'object')
);
-- Index adaptés aux recherches fréquentes : par type et date, par compte et date.
CREATE INDEX journal_type_date_idx   ON journal_evenement (type, horodatage DESC);
CREATE INDEX journal_compte_date_idx ON journal_evenement (compte_id, horodatage DESC);

-- ---------------------------------------------------------------------
-- 4. Inventaire
-- ---------------------------------------------------------------------

-- Exemplaire précis d'un objet, possédé par un personnage.
-- Séparer modèle et instance évite les bugs de duplication : un échange
-- déplace l'instance, il ne crée jamais d'objet.
CREATE TABLE instance_objet (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    objet_id         INTEGER NOT NULL REFERENCES objet(id),
    proprietaire_id  INTEGER NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    quantite         INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
    equipe           BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX instance_proprietaire_idx ON instance_objet (proprietaire_id);

-- Un objet non empilable (une épée) a toujours une quantité de 1.
CREATE FUNCTION verifier_quantite_instance() RETURNS trigger AS $$
BEGIN
    IF NEW.quantite > 1 AND NOT (SELECT empilable FROM objet WHERE id = NEW.objet_id) THEN
        RAISE EXCEPTION 'L''objet % n''est pas empilable', (SELECT code FROM objet WHERE id = NEW.objet_id)
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER instance_quantite
    BEFORE INSERT OR UPDATE OF quantite, objet_id ON instance_objet
    FOR EACH ROW EXECUTE FUNCTION verifier_quantite_instance();

-- Règle du jeu : un seul objet équipé par emplacement (une arme, un casque...),
-- sauf les reliques : deux au maximum. Un objet sans emplacement (potion,
-- ressource) ne peut pas être équipé.
-- (Le client a eu un bug « 3 reliques équipées » : la base l'aurait refusé.)
CREATE FUNCTION verifier_equipement() RETURNS trigger AS $$
DECLARE
    v_emplacement  TEXT;
    v_code         TEXT;
    v_maximum      INTEGER;
    v_deja         INTEGER;
BEGIN
    IF NOT NEW.equipe THEN
        RETURN NEW;
    END IF;
    SELECT emplacement, code INTO v_emplacement, v_code FROM objet WHERE id = NEW.objet_id;
    IF v_emplacement IS NULL THEN
        RAISE EXCEPTION 'L''objet % ne s''équipe pas', v_code
            USING ERRCODE = 'check_violation';
    END IF;

    -- Verrouille le personnage : deux requêtes simultanées ne peuvent pas
    -- équiper chacune un objet sur le même emplacement.
    PERFORM 1 FROM personnage WHERE id = NEW.proprietaire_id FOR UPDATE;

    v_maximum := CASE v_emplacement WHEN 'relique' THEN 2 ELSE 1 END;
    SELECT count(*) INTO v_deja
      FROM instance_objet io
      JOIN objet o ON o.id = io.objet_id
     WHERE io.proprietaire_id = NEW.proprietaire_id
       AND io.equipe
       AND o.emplacement = v_emplacement
       AND io.id <> NEW.id;
    IF v_deja >= v_maximum THEN
        RAISE EXCEPTION 'Emplacement « % » déjà occupé (% objet(s) équipé(s) au maximum)', v_emplacement, v_maximum
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER instance_equipement
    BEFORE INSERT OR UPDATE OF equipe, objet_id, proprietaire_id ON instance_objet
    FOR EACH ROW EXECUTE FUNCTION verifier_equipement();

-- ---------------------------------------------------------------------
-- 5. Interactions et échanges entre joueurs
-- ---------------------------------------------------------------------

CREATE TABLE interaction (
    id               INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    emetteur_id      INTEGER     NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    destinataire_id  INTEGER     NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    session_id       INTEGER     REFERENCES session_jeu(id) ON DELETE SET NULL,
    type             TEXT        NOT NULL CHECK (type IN ('message','combat','echange')),
    horodatage       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT interaction_deux_joueurs CHECK (emetteur_id <> destinataire_id)
);
CREATE INDEX interaction_emetteur_idx ON interaction (emetteur_id);
CREATE INDEX interaction_destinataire_idx ON interaction (destinataire_id);

CREATE TABLE echange (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    interaction_id   INTEGER NOT NULL UNIQUE REFERENCES interaction(id) ON DELETE CASCADE,
    or_emetteur      INTEGER NOT NULL DEFAULT 0 CHECK (or_emetteur >= 0),      -- or donné par l'émetteur
    or_destinataire  INTEGER NOT NULL DEFAULT 0 CHECK (or_destinataire >= 0),  -- or donné par le destinataire
    statut           TEXT    NOT NULL DEFAULT 'propose'
                     CHECK (statut IN ('propose','accepte','refuse','annule'))
);

-- Objets mis en jeu dans un échange, et qui les donne.
CREATE TABLE ligne_echange (
    echange_id   INTEGER NOT NULL REFERENCES echange(id) ON DELETE CASCADE,
    instance_id  INTEGER NOT NULL REFERENCES instance_objet(id),
    donneur_id   INTEGER NOT NULL REFERENCES personnage(id),
    PRIMARY KEY (echange_id, instance_id)
);

-- Réalise un échange de façon ATOMIQUE : soit tout est transféré, soit rien.
-- Les lignes concernées sont verrouillées (FOR UPDATE) : pendant l'échange,
-- personne d'autre ne peut modifier ces personnages ni ces objets.
-- Toute erreur annule l'ensemble : aucun objet ne peut être dupliqué ni perdu.
CREATE FUNCTION effectuer_echange(p_echange_id INTEGER) RETURNS void AS $$
DECLARE
    v_echange       echange%ROWTYPE;
    v_emetteur      INTEGER;
    v_destinataire  INTEGER;
    v_type          TEXT;
    v_ligne         RECORD;
BEGIN
    -- 1. Verrouiller l'échange et vérifier qu'il est encore en attente
    SELECT * INTO v_echange FROM echange WHERE id = p_echange_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Échange % introuvable', p_echange_id;
    END IF;
    IF v_echange.statut <> 'propose' THEN
        RAISE EXCEPTION 'Échange % déjà traité (statut : %)', p_echange_id, v_echange.statut;
    END IF;

    SELECT emetteur_id, destinataire_id, type
      INTO v_emetteur, v_destinataire, v_type
      FROM interaction WHERE id = v_echange.interaction_id;
    IF v_type <> 'echange' THEN
        RAISE EXCEPTION 'L''interaction liée à l''échange % n''est pas un échange', p_echange_id;
    END IF;

    -- 2. Verrouiller les deux personnages, toujours dans le même ordre (id croissant)
    --    pour éviter un interblocage si deux échanges croisés arrivent en même temps
    PERFORM 1 FROM personnage
     WHERE id IN (v_emetteur, v_destinataire)
     ORDER BY id
       FOR UPDATE;

    -- 3. Vérifier et transférer chaque objet
    FOR v_ligne IN
        SELECT le.instance_id, le.donneur_id, io.proprietaire_id, io.equipe
          FROM ligne_echange le
          JOIN instance_objet io ON io.id = le.instance_id
         WHERE le.echange_id = p_echange_id
         ORDER BY le.instance_id
           FOR UPDATE OF io
    LOOP
        IF v_ligne.donneur_id NOT IN (v_emetteur, v_destinataire) THEN
            RAISE EXCEPTION 'Le donneur % ne participe pas à l''échange', v_ligne.donneur_id;
        END IF;
        IF v_ligne.proprietaire_id <> v_ligne.donneur_id THEN
            RAISE EXCEPTION 'L''objet % n''appartient plus à son donneur', v_ligne.instance_id;
        END IF;
        IF v_ligne.equipe THEN
            RAISE EXCEPTION 'L''objet % est équipé et ne peut pas être échangé', v_ligne.instance_id;
        END IF;

        UPDATE instance_objet
           SET proprietaire_id = CASE WHEN v_ligne.donneur_id = v_emetteur
                                      THEN v_destinataire ELSE v_emetteur END
         WHERE id = v_ligne.instance_id;
    END LOOP;

    -- 4. Transférer l'or (la contrainte pieces_or >= 0 refuse un solde négatif)
    UPDATE personnage
       SET pieces_or = pieces_or - v_echange.or_emetteur + v_echange.or_destinataire
     WHERE id = v_emetteur;
    UPDATE personnage
       SET pieces_or = pieces_or - v_echange.or_destinataire + v_echange.or_emetteur
     WHERE id = v_destinataire;

    -- 5. Clore l'échange
    UPDATE echange SET statut = 'accepte' WHERE id = p_echange_id;
END;
$$ LANGUAGE plpgsql;

COMMIT;
