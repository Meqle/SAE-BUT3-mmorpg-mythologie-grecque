# Feuille de route et planification du projet - Mythologia 2D (SAE BUT3)

Ce document formalise l'architecture, la feuille de route prévisionnelle, l'état d'avancement réel, la répartition des rôles et les contrats d'interfaces pour le projet de MMORPG mythologique en vue hybride (SAE BUT3 Informatique).

---

## 1. Vue d'ensemble et répartition des pôles

Le projet est développé en architecture monorepo modulaire (`packages/shared`, `packages/server`, `packages/client`) sous Docker.

| Pôle | Responsable(s) | Périmètre technique principal |
| :--- | :--- | :--- |
| **Pôle Développement (Client / Moteur 2D)** | 2 Développeurs (Dev A & Dev B) | Moteur PixiJS, vue top-down et profil, HUD React, décors, animations et intégration client WebSocket. |
| **Pôle Réseau** | 1 Développeur Réseau | Serveur WebSocket Node.js, boucle autoritaire (20 Hz), gestion des instances/salles, synchronisation d'état et sécurité. |
| **Pôle Base de Données** | 1 Développeur BDD | Schéma relationnel (3NF), persistance PostgreSQL, migrations, ORM, API REST d'authentification et transactions d'inventaire. |
| **Pôle DevOps & Qualité** | Rôle transverse (DevOps) | Conteneurisation Docker multi-stage, orchestration Compose, règles de protection Git Flow, pipelines CI GitHub Actions et packaging. |

---

## 2. État d'avancement par pôle

### 2.1 Pôle Développement - Moteur de jeu & Client React / PixiJS
*Dossier : `packages/client/`*

#### Tâches terminées :
- [x] Initialisation de l'application client en TypeScript avec Vite et React 18.
- [x] Intégration du viewport et canvas PixiJS v8 dans le cycle de vie React.
- [x] Écran d'accueil et Lobby mythologique complet en pixel art (sélection du serveur, allégeance aux 6 divinités, arbre des dons divins).
- [x] Moteur de déplacement en vue du dessus (8 directions, normalisation diagonale, caméra fluide centrée sur le héros).
- [x] Moteur de déplacement en vue de profil (gravité à 900 px/s², saut impulsionnel à -480 px/s, plateforme prototype au sol).
- [x] Intégration du client réseau WebSocket (connexion au point d'entrée `/ws`, envoi des paquets `PLAYER_INPUT` à 20 Hz, prédiction locale, réconciliation sur snapshot `WORLD_TICK`, rendu graphique des joueurs distants).

#### Tâches en cours et à venir :
- [ ] **Sous-tâche A (Interface & Expérience joueur)** :
  - [ ] HUD en jeu : barre de vie (PV / MaxHP), barre d'endurance/énergie divine, badge du dieu protecteur.
  - [ ] Boîte de dialogue et chat textuel multijoueur (overlay React avec onglets Général/Système, canal de discussion de salle).
  - [ ] Mini-carte prototype ou boussole des points cardinaux de l'Olympe.
  - [ ] Menu pause / options en jeu (gestion du son, raccourcis clavier ZQSD / WASD).
- [ ] **Sous-tâche B (Monde, Sprites & Moteur physique local)** :
  - [ ] Remplacement des formes géométriques temporaires par des spritesheets animés (héros, animations marche, course, saut, idle).
  - [ ] Moteur de tuiles (Tileset) pour les décors antiques (temple d'Olympe, dalles de marbre, colonnes doriques, autels votifs).
  - [ ] Système de collision 2D par boîtes AABB (blocage contre les murs de temple, falaises et obstacles du monde).
  - [ ] Tri de profondeur 2D (`y-sorting`) pour que les personnages passent devant ou derrière les colonnes.
- [ ] **Gameplay avancé (Boss & Lore en vue de côté)** :
  - [ ] Transition automatique en vue de profil lors de l'entrée dans une arène de boss divin.
  - [ ] Mécanique de combat non linéaire : énigmes de plateforme et collecte d'artefacts sacrés pour désactiver l'invulnérabilité du boss.
  - [ ] Patterns d'attaques du boss (projectiles divins, ondes de choc au sol nécessitant un saut synchronisé).
- [ ] **Packaging final** :
  - [ ] Packaging Desktop en exécutable natif via Tauri ou Electron.

---

### 2.2 Pôle Réseau - Architecture Client-Serveur & Synchronisation
*Dossier : `packages/server/`*

#### Tâches terminées :
- [x] Serveur WebSocket opérationnel (`ws`, point d'entrée `/ws`).
- [x] Boucle de simulation autoritaire côté serveur à 20 ticks par seconde (50 ms par tick).
- [x] Gestion des salles d'instances en mémoire (`Map<roomId, Map<playerId, PlayerSession>>`).
- [x] Validation stricte des entrées clavier (`PLAYER_INPUT`) côté serveur (directions boéliennes, vitesse bornée).
- [x] Diffusion périodique des snapshots du monde (`WORLD_TICK`) aux clients d'une salle.
- [x] Gestion propre des déconnexions (nettoyage de la session joueur et suppression des salles vides).
- [x] Protections de base (taille max de message 4 Ko, débit limité à 60 msg/s par socket, filtrage d'origine CORS/Origin).

#### Tâches en cours et à venir :
- [ ] Diffusion des messages de chat textuel (`CHAT_SEND` -> `CHAT_BROADCAST`).
- [ ] Gestion des reconnexions et persistance transitoire de session.
- [ ] Optimisation de la bande passante :
  - [ ] Snapshots différentiels (envoi des deltas d'état plutôt que de l'état complet).
  - [ ] Culling spatial (filtrage des joueurs selon la distance de visibilité).
- [ ] Synchronisation des entités dynamiques supplémentaires (points de vie synchronisés, déclenchement d'artefacts, état des boss).

---

### 2.3 Pôle Base de Données - Modélisation & Persistance
*Dossier : `packages/server/src/db/`*

#### Tâches terminées :
- [x] Modèle Conceptuel et Logique de Données (MCD / MLD complet en 3NF) :
  - Tables d'identité : `COMPTE` (email, hash mot de passe, rôle, statut).
  - Tables de jeu : `PERSONNAGE` (niveau, PV, coordonnées x/y, mode de vue, classe, zone), `CLASSE`, `ZONE`.
  - Tables de lore & combats : `BOSS`, `VICTOIRE_BOSS`, `CLASSEMENT_SAISON`.
  - Tables d'économie & inventaire : `OBJET`, `INSTANCE_OBJET`, `PROGRESSION_QUETE`.
  - Tables de traçabilité multijoueur : `SESSION_JEU`, `INTERACTION`, `ECHANGE`, `LIGNE_ECHANGE`.

#### Tâches en cours et à venir :
- [ ] Initialisation de la base PostgreSQL (scripts DDL SQL `schema.sql` et fixtures/seed).
- [ ] Choix et configuration d'un ORM ou query-builder (Prisma / Drizzle).
- [ ] API REST d'authentification (`POST /api/auth/register`, `POST /api/auth/login` avec hachage bcrypt et jetons JWT).
- [ ] API REST de gestion de personnages (`GET /api/characters`, `POST /api/characters`).
- [ ] Intégration de la persistance avec la session WebSocket :
  - [ ] Chargement du personnage en base lors de l'entrée dans une salle.
  - [ ] Sauvegarde périodique et lors de la déconnexion (coordonnées, PV, inventaire).

---

### 2.4 Pôle DevOps & Qualité de code
*Dossiers : racine, `.github/`, configuration Docker*

#### Tâches terminées :
- [x] Monorepo npm workspaces configuré et build TypeScript unifié.
- [x] Conteneurisation Docker multi-stage (Node.js 24 Alpine pour le build et le serveur, Nginx Alpine pour le client statique).
- [x] Orchestration Docker Compose avec reverse-proxy Nginx (ports 8080 exposé, port 3001 interne, proxy `/ws` et `/api`).
- [x] Healthcheck conteneur et reprise automatique de service.
- [x] Configuration des règles de protection de branches GitHub (interdiction des pushs directs sur `main` et `dev`, obligation de Pull Request avec validation).
- [x] Normalisation des conventions de branches Git (`feat/...`, `fix/...`, `docs/...`).

#### Tâches en cours et à venir :
- [ ] Pipeline CI GitHub Actions (`.github/workflows/ci.yml`) :
  - [ ] Linter et vérification des types (`tsc --noEmit`).
  - [ ] Validation automatique du build monorepo (`npm run build`).
  - [ ] Validation du build des images Docker en pré-merge.
- [ ] Packaging Desktop multiplateforme (script de release automatique).

---

## 3. Planification par jalons (Roadmap des Sprints)

### Jalon 1 : Socle architectural & Prototype fonctionnel (Terminé)
- Architecture monorepo, configuration TypeScript et Docker Compose.
- Écran titre pixel art et lobby mythologique complet.
- Moteur 2D PixiJS en double vue (top-down et profil).
- Boucle réseau WebSocket avec déplacement synchronisé multijoueur.
- Schéma relationnel BDD validé.

### Jalon 2 : Gameplay, Décors, HUD et Persistance (En cours)
- **Développement A** : Intégration du HUD React, barres de statut et chat textuel.
- **Développement B** : Intégration des décors pixel art, tileset d'Olympe et masques de collision AABB.
- **Réseau** : Relais des paquets de chat et déconnexion sécurisée.
- **Base de données** : Mise en place de PostgreSQL, migrations DDL, authentification JWT et sauvegarde de position.

### Jalon 3 : Boss Mythologique, Système de Quêtes & Économie
- Arène de boss en vue de côté avec énigmes et artefacts d'affaiblissement.
- Gestion d'inventaire et échanges sécurisés entre joueurs.
- Persistance complète des victoires de boss et classements de saison.

### Jalon 4 : Finitions, Packaging Desktop & Préparation Soutenance
- Pipeline CI/CD GitHub Actions complète.
- Packaging exécutable desktop (Tauri / Electron).
- Documentation technique d'architecture et rapport de projet SAE.
- Vidéo de démonstration et répétition de la soutenance orale.

---

## 4. Règles de collaboration et contrats d'interfaces

1. **Le contrat partagé (`packages/shared`)** :
   - Tout nouveau paquet réseau ou structure de données partagée doit d'abord être déclaré dans `packages/shared/src/index.ts`.
   - Les types sont stricts, typés TypeScript et compilés en ESM.

2. **Politique Git Flow** :
   - Aucune modification directe sur `main` ni sur `dev`.
   - Création systématique d'une branche préfixée : `feat/<nom-fonctionnalite>`.
   - Revue de code et validation obligatoire par Pull Request avant merge dans `dev`.
   - Les fusions vers `main` correspondent aux versions taguées et présentables aux jurys.
