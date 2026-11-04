-- =====================================================================
-- Mythologia — Schéma PostgreSQL
-- Pôle Base de données
--
-- Ce script crée toutes les tables du jeu, avec leurs contraintes.
-- Principe : les règles importantes du jeu sont vérifiées PAR LA BASE
-- (CHECK, UNIQUE, clés étrangères, triggers). Même si le serveur a un
-- bug, la base refuse une donnée incohérente.
--
-- Ordre d'exécution : schema.sql -> seed.sql -> demo.sql (optionnel)
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Référentiels du jeu (remplis par seed.sql, rarement modifiés)
-- ---------------------------------------------------------------------

-- Classe du personnage : son style de combat.
-- Pas de classe de soin : tous les personnages ont des sorts de soin.
CREATE TABLE classe (
    id            SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code          TEXT     NOT NULL UNIQUE,          -- ex. 'GUERRIER', utilisé côté TypeScript
    nom           TEXT     NOT NULL UNIQUE,
    description   TEXT     NOT NULL DEFAULT '',
    pv_base       INTEGER  NOT NULL CHECK (pv_base > 0),
    attaque_base  INTEGER  NOT NULL CHECK (attaque_base >= 0),
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
    nom         TEXT     NOT NULL UNIQUE,
    royaume     TEXT     NOT NULL CHECK (royaume IN ('olympus','elysium','tartarus')),
    niveau_min  SMALLINT NOT NULL DEFAULT 1 CHECK (niveau_min BETWEEN 1 AND 100)
);

-- Boss divin : chaque divinité garde une zone (au plus un boss par zone).
CREATE TABLE boss (
    code           TEXT     PRIMARY KEY,
    divinite_code  TEXT     NOT NULL UNIQUE REFERENCES divinite(code),
    zone_id        SMALLINT NOT NULL UNIQUE REFERENCES zone(id),
    nom            TEXT     NOT NULL,
    titre          TEXT     NOT NULL,
    niveau         SMALLINT NOT NULL CHECK (niveau BETWEEN 1 AND 100)
);

-- Modèle d'objet : "l'épée de bronze" en général.
-- Le détail (statistiques, effets) est stocké dans MongoDB.
CREATE TABLE objet (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom          TEXT    NOT NULL UNIQUE,
    description  TEXT    NOT NULL DEFAULT '',
    categorie    TEXT    NOT NULL
                 CHECK (categorie IN ('arme','armure','consommable','artefact','ressource')),
    rarete       TEXT    NOT NULL DEFAULT 'commun'
                 CHECK (rarete IN ('commun','rare','epique','legendaire','divin')),
    empilable    BOOLEAN NOT NULL DEFAULT FALSE,     -- les potions s'empilent, les épées non
    prix         INTEGER NOT NULL DEFAULT 0 CHECK (prix >= 0)
);

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
    experience     INTEGER          NOT NULL DEFAULT 0 CHECK (experience >= 0),
    pv             INTEGER          NOT NULL CHECK (pv >= 0),
    pv_max         INTEGER          NOT NULL CHECK (pv_max > 0),
    -- Dernière position sauvegardée. La position en direct vit dans le serveur
    -- (et plus tard dans Redis) ; elle est recopiée ici régulièrement et à la déconnexion.
    position_x     DOUBLE PRECISION NOT NULL DEFAULT 400,
    position_y     DOUBLE PRECISION NOT NULL DEFAULT 300,
    mode_vue       TEXT             NOT NULL DEFAULT 'top-down'
                   CHECK (mode_vue IN ('top-down','side-view')),
    pieces_or      INTEGER          NOT NULL DEFAULT 0 CHECK (pieces_or >= 0),
    date_creation  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    CONSTRAINT personnage_pv_max CHECK (pv <= pv_max),
    CONSTRAINT personnage_nom_format CHECK (nom ~ '^[A-Za-zÀ-ÿ0-9_ -]{3,20}$')
);
CREATE UNIQUE INDEX personnage_nom_unique ON personnage (lower(nom));
CREATE INDEX personnage_compte_idx ON personnage (compte_id);

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

-- Avancement des quêtes. Le contenu des quêtes (étapes, dialogues) est dans
-- MongoDB : quete_id est l'identifiant du document correspondant.
CREATE TABLE progression_quete (
    personnage_id  INTEGER     NOT NULL REFERENCES personnage(id) ON DELETE CASCADE,
    quete_id       TEXT        NOT NULL,
    statut         TEXT        NOT NULL DEFAULT 'en_cours'
                   CHECK (statut IN ('en_cours','terminee','abandonnee')),
    date_maj       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (personnage_id, quete_id)
);

CREATE FUNCTION maj_date_progression() RETURNS trigger AS $$
BEGIN
    NEW.date_maj := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER progression_date_maj
    BEFORE UPDATE ON progression_quete
    FOR EACH ROW EXECUTE FUNCTION maj_date_progression();

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
        RAISE EXCEPTION 'L''objet % n''est pas empilable', NEW.objet_id
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER instance_quantite
    BEFORE INSERT OR UPDATE OF quantite, objet_id ON instance_objet
    FOR EACH ROW EXECUTE FUNCTION verifier_quantite_instance();

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
