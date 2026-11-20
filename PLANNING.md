# Feuille de route et planification du projet - Mythologia 2D (SAE BUT3)

Ce document formalise l'architecture, la feuille de route prévisionnelle, l'état d'avancement réel, la répartition des rôles et les contrats d'interfaces pour le projet de MMORPG mythologique en vue hybride (SAE BUT3 Informatique).

---

## 1. Vue d'ensemble et répartition des pôles

Le projet est développé en architecture monorepo modulaire (`packages/shared`, `packages/server`, `packages/client`) sous Docker.

| Pôle | Responsable(s) | Périmètre technique principal |
| :--- | :--- | :--- |
| **Pôle Développement (Client / Moteur 2D)** | 2 Développeurs (Dev A & Dev B) | Moteur PixiJS, vue top-down et profil, HUD React, décors, animations, gameplay RPG et intégration client WebSocket. |
| **Pôle Réseau** | 1 Développeur Réseau | Serveur WebSocket Node.js, boucle autoritaire (20 Hz), gestion des instances/salles, synchronisation d'état et sécurité. |
| **Pôle Base de Données** | 1 Développeur BDD | Schéma relationnel PostgreSQL (3NF), persistance NoSQL (MongoDB), API REST d'authentification et transactions d'inventaire. |
| **Pôle DevOps & Qualité** | Rôle transverse (DevOps) | Conteneurisation Docker multi-stage, orchestration Compose, règles de protection Git Flow, pipelines CI GitHub Actions et packaging. |

---

## 2. État d'avancement par pôle

### 2.1 Pôle Développement - Moteur de jeu & Client React / PixiJS
*Dossier : `packages/client/`*

#### Tâches terminées :
- [x] Initialisation de l'application client en TypeScript avec Vite et React 18.
- [x] Intégration du viewport et canvas PixiJS v8 dans le cycle de vie React.
- [x] Écran d'accueil et Lobby mythologique complet (choix du nom, 4 classes jouables, 6 divinités protectrices alignées sur `seed.sql`, prologue narratif).
- [x] Direction artistique antique cohérente (style Acropole en fin d'après-midi, ombres portées, façades grecques détaillées, sprites distincts par classe en vue du dessus et de profil).
- [x] Moteur de déplacement double perspective : 8 directions en vue du dessus + gravité/saut en vue de profil, collisions AABB (murs, bâtiments, eau bloquée) et tri de profondeur.
- [x] Intégration du client réseau WebSocket (connexion `/ws`, envoi `PLAYER_INPUT` à 20 Hz, prédiction locale, interpolation et rendu des joueurs distants).
- [x] Monde jouable en **9 zones** :
  - 6 zones extérieures : *Cité de l'Agora* (spawn), *Plaines Foudroyées*, *Sanctuaire Brisé*, *Rivage d'Égée* (vue de profil), *Labyrinthe des Brumes* (dédale 2480×1720) et *Marécages de Lerne*.
  - 3 bâtiments visitables dans l'Agora : *Taverne des Héros* (animée avec Dionysios, Homère et clients), *Atelier de la Forge* (Damon) et *Infirmerie* (Cassandre).
- [x] Système de combat complet : attaque principale (`Clic G`), pouvoir divin (`Clic D`), combos 3 coups et styles propres par classe, esquive (`Maj`), effets sonores Web Audio, secousse caméra et malus de mort (-15 % drachmes, -25 % XP du niveau).
- [x] Bestiaire de 10 créatures dont **4 boss** (*Gardien d'Airain*, *Sentinelle de Poséidon* avec 3 stèles d'affaiblissement, *Minotaure des Brumes*, *Hydre de Lerne*) avec patterns aléatoires, télégraphes contextuels et phase d'enrage sous 50 % PV.
- [x] Progression & quêtes : 6 quêtes principales (verrouillant l'accès progressif aux zones), 6 quêtes secondaires (dont initiation aux ateliers), codex évolutif, coffres dissimulés et coffres scellés à énigmes.
- [x] Système de loot par rareté (probabilités faibles et décroissantes *Commun → Rare → Épique → Légendaire*, butin physique au sol), économie équilibrée, achat/revente chez les marchands et **craft séparé** (recettes simples en poche vs recettes avancées dans les ateliers PNJ).
- [x] Interface complète : HUD épuré, minimap canvas temps réel, carte de zone & carte du monde avec voyage rapide (`M`), fiche personnage & sac en grille (8 emplacements d'équipement), double arbre de talents libre jusqu'au niveau 40 (2 voies par classe + 2 voies par dieu avec sorts actifs sur `1`–`4`), menu Pause (`Échap`) avec bestiaire et reconfiguration clavier/souris.

#### Tâches en cours et à venir :
- [ ] **Interface & Multijoueur** :
  - [ ] Chat textuel multijoueur (overlay React connecté aux paquets réseau).
  - [ ] Synchronisation client-serveur sur toutes les nouvelles zones et combats PvE coopératifs (en lien avec le Pôle Réseau).
- [ ] **Persistance distante** :
  - [ ] Remplacement de la sauvegarde locale (`localStorage`) par les appels API REST vers la base SQL/NoSQL du Pôle BDD.
- [ ] **Contenu Endgame (Acte III & Raids)** :
  - [ ] Donjon *Enclume Souterraine d'Héphaïstos*, *Ascension du Caucase* (libération de Prométhée) et raids du *Mont Olympe*.
- [ ] **Packaging final** :
  - [ ] Packaging Desktop en exécutable natif via Tauri ou Electron.

---

### 2.2 Pôle Réseau - Architecture Client-Serveur & Synchronisation
*Dossier : `packages/server/`*

#### Tâches terminées :
- [x] Serveur WebSocket opérationnel (`ws`, point d'entrée `/ws`).
- [x] Boucle de simulation autoritaire côté serveur à 20 ticks par seconde (50 ms par tick).
- [x] Gestion des salles d'instances en mémoire (`Map<roomId, Map<playerId, PlayerSession>>`).
- [x] Validation stricte des entrées clavier (`PLAYER_INPUT`) côté serveur et correction de la synchronisation de position (`fix/player-position-sync`).
- [x] Diffusion périodique des snapshots du monde (`WORLD_TICK`) aux clients d'une salle.
- [x] Gestion propre des déconnexions (nettoyage de la session joueur et suppression des salles vides).
- [x] Protections de base (taille max de message 4 Ko, débit limité à 60 msg/s par socket, filtrage d'origine CORS/Origin).

#### Tâches en cours et à venir :
- [ ] Extension des cartes serveur dans `packages/shared` pour synchroniser les nouvelles zones et donjons.
- [ ] Diffusion des messages de chat textuel (`CHAT_SEND` -> `CHAT_BROADCAST`).
- [ ] Gestion des reconnexions et persistance transitoire de session.
- [ ] Optimisation de la bande passante (snapshots différentiels, culling spatial).
- [ ] Synchronisation des entités dynamiques (PV, monstres, boss, butin partagé en coop donjon).

---

### 2.3 Pôle Base de Données - Modélisation & Persistance
*Dossier : `packages/server/src/db/`*

#### Tâches terminées :
- [x] Modèle Conceptuel et Logique de Données (MCD / MLD complet en 3NF, 15 tables).
- [x] Initialisation de la base PostgreSQL sous Docker : scripts `schema.sql` (contraintes, triggers, fonction d'échange atomique `effectuer_echange`), `seed.sql` (référentiels classes/divinités/zones/boss/objets) et `demo.sql`.

#### Tâches en cours et à venir :
- [ ] Volet NoSQL (MongoDB) pour les documents de quêtes, détails d'objets, patterns de boss et progression étendue.
- [ ] API REST d'authentification (`POST /api/auth/register`, `POST /api/auth/login` avec bcrypt et JWT).
- [ ] API REST de personnages et sauvegarde (`GET/POST /api/characters`, `PUT /api/characters/:id/save`).
- [ ] Intégration de la persistance avec le client et la session WebSocket.

---

### 2.4 Pôle DevOps & Qualité de code
*Dossiers : racine, `.github/`, configuration Docker*

#### Tâches terminées :
- [x] Monorepo npm workspaces configuré et build TypeScript unifié.
- [x] Conteneurisation Docker multi-stage (Node.js 24 Alpine pour le build et le serveur, Nginx Alpine pour le client statique).
- [x] Orchestration Docker Compose avec reverse-proxy Nginx et service PostgreSQL.
- [x] Healthcheck conteneur et reprise automatique de service.
- [x] Règles de protection de branches GitHub (Pull Request obligatoire vers `main` et `dev`).
- [x] Normalisation des conventions de branches Git (`feat/...`, `fix/...`, `docs/...`).

#### Tâches en cours et à venir :
- [ ] Pipeline CI GitHub Actions (`.github/workflows/ci.yml`) : vérification TypeScript, build monorepo et build Docker.
- [ ] Nettoyage régulier des branches fusionnées (suppression automatique après merge de PR).
- [ ] Packaging Desktop multiplateforme.

---

## 3. Planification par jalons (Roadmap des Sprints)

### Jalon 1 : Socle architectural & Prototype fonctionnel (Terminé)
- Architecture monorepo, TypeScript, Docker Compose et écran titre / lobby.
- Moteur 2D PixiJS double vue, boucle WebSocket multijoueur et modélisation BDD.

### Jalon 2 : Gameplay Early Game, Décors, HUD et Base SQL (Terminé côté client & SQL)
- Refonte graphique antique, Cité de l'Agora agrandie avec 3 bâtiments visitables, HUD, minimap, carte interactive et menu pause.
- Base PostgreSQL opérationnelle (`schema.sql`, `seed.sql`, `demo.sql`) et correction synchro réseau.
- Reste sur ce jalon : chat multijoueur et branchement API d'authentification / sauvegarde.

### Jalon 3 : Donjons Mid Game, Boss, Quêtes, Craft & Arbres de talents (En cours — Client jouable)
- 4 boss jouables (dont Rivage en vue de profil, Labyrinthe des Brumes et Marécages de Lerne).
- 6 quêtes principales, 6 secondaires, drops par rareté, inventaire complet, craft en ateliers, économie et arbres de talents libres jusqu'au niveau 40.
- Reste sur ce jalon : intégration API BDD (SQL + NoSQL), synchro coop multi-zones côté serveur et contenu Endgame (Caucase / Olympe).

### Jalon 4 : Finitions, CI/CD, Packaging & Soutenance (À venir)
- Pipeline CI/CD GitHub Actions et nettoyage du dépôt.
- Packaging exécutable desktop (Tauri / Electron).
- Rapport technique SAE, démonstration et soutenance orale.

---

## 4. Règles de collaboration et contrats d'interfaces

1. **Le contrat partagé (`packages/shared`)** :
   - Tout nouveau paquet réseau ou structure de données partagée doit d'abord être déclaré dans `packages/shared/src/index.ts`.
   - Les types sont stricts, typés TypeScript et compilés en ESM.

2. **Politique Git Flow & propreté du dépôt** :
   - Aucune modification directe sur `main` ni sur `dev`.
   - Création systématique d'une branche préfixée : `feat/<nom-fonctionnalite>`, `fix/<nom-correctif>`, `docs/<sujet>`.
   - Revue de code et validation par Pull Request avant merge.
   - **Suppression systématique des branches fusionnées** (en local et sur GitHub après merge de la PR) pour garder un historique clair et éviter les branches mortes.
