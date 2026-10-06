# Feuille de route et planification du projet (SAE BUT3)

Ce document détaille la répartition des tâches, l'état d'avancement, la stratégie DevOps et les contrats d'interfaces entre les pôles du projet.

---

## 1. Pôle Développement (Client & Moteur de jeu)

Responsable : Développement frontend, moteur 2D PixiJS, interface utilisateur et intégration.
Dossier principal : `packages/client/`

### Tâches réalisées :
- [x] Initialisation de l'architecture monorepo et configuration TypeScript / Vite.
- [x] Écran titre et interface du Lobby en pixel art (sélection de serveur, panthéon, dons divins).
- [x] Intégration du moteur PixiJS dans React.
- [x] Moteur de déplacement en vue du dessus (8 directions, normalisation diagonale, caméra fluide).
- [x] Prototype de transition vers la vue de profil (gravité, plateformes, saut).
- [x] Intégration du client réseau temps réel (connexion WebSocket, prédiction locale, réconciliation avec snapshots serveur, rendu multi-joueurs).

### Tâches à venir :
- [ ] Remplacement des formes géométriques par des spritesheets 2D (héros, décors du mont Olympe).
- [ ] Système d'animations par état (marche, saut, course, idle, compétences).
- [ ] Gestion des masques de collision (tilesets / obstacles de la carte).
- [ ] Interface en jeu (HUD : barre de vie, niveau, endurance, chat).
- [ ] Mécanique des défis de boss en vue de profil (énigmes, plateformes, artefacts d'affaiblissement).
- [ ] Packaging Desktop en fin de projet (intégration Tauri / Electron pour exécutable natif).

---

## 2. Pôle Réseau (Architecture Client-Serveur & Synchronisation)

Responsable : Communication temps réel, synchronisation d'état et gestion des instances de jeu.
Dossier principal : `packages/server/`

### Tâches réalisées :
- [x] Serveur WebSocket opérationnel (`ws`, point d'entrée `/ws`).
- [x] Boucle de simulation autoritaire côté serveur à 20 ticks par seconde.
- [x] Gestion des salles en mémoire (`Map<roomId, Map<playerId, PlayerSession>>`).
- [x] Réception des entrées clavier clients (`PLAYER_INPUT`) et validation stricte côté serveur.
- [x] Diffusion périodique de l'état du monde (`WORLD_TICK`) à tous les clients d'une salle.
- [x] Prise en charge des déconnexions (nettoyage de session et suppression des salles vides).
- [x] Sécurisation de base (limitation de débit à 60 msg/s, taille max 4 Ko, filtrage Origin).

### Tâches à venir :
- [ ] Gestion de la reconnexion avec restauration de session.
- [ ] Système de chat textuel en temps réel entre joueurs d'une même instance.
- [ ] Optimisation de la bande passante (delta snapshots et culling spatial selon la portée de vue).
- [ ] Synchronisation des états de boss et d'artefacts d'arène.

---

## 3. Pôle Base de Données (Persistance & API REST)

Responsable : Modélisation des données, persistance PostgreSQL et API REST d'authentification.
Dossier principal : `packages/server/` (`src/db/`, `src/routes/`)

### Tâches réalisées :
- [x] Conception du schéma relationnel (MCD / MLD complet) :
  - Tables principales : `COMPTE`, `PERSONNAGE`, `CLASSE`, `ZONE`, `BOSS`, `VICTOIRE_BOSS`.
  - Tables de progression et inventaire : `PROGRESSION_QUETE`, `OBJET`, `INSTANCE_OBJET`.
  - Tables multijoueurs : `SESSION_JEU`, `INTERACTION`, `ECHANGE`, `LIGNE_ECHANGE`, `CLASSEMENT_SAISON`.

### Tâches à venir :
- [ ] Initialisation de la base PostgreSQL (schéma DDL, scripts de migration et fixtures/seed).
- [ ] Intégration d'un ORM ou query builder adapté (Prisma / Drizzle / Kysely).
- [ ] Développement des endpoints REST d'authentification (`POST /api/auth/register`, `POST /api/auth/login` avec hachage bcrypt et JWT).
- [ ] Endpoints de gestion de personnages et inventaire (`GET /api/characters`, `POST /api/characters`).
- [ ] Liaison de la persistance avec le serveur WebSocket (chargement du personnage à l'entrée en salle, sauvegarde lors de la déconnexion).

---

## 4. Pôle DevOps & Qualité de Code

Responsable : Intégration continue, conteneurisation, normes Git et flux de livraison.
Fichiers : `Dockerfile`, `docker-compose.yml`, `.github/workflows/`

### Tâches réalisées :
- [x] Conteneurisation complète avec Docker (build multi-stage Node.js 24 + image Nginx Alpine pour le client).
- [x] Orchestration Docker Compose (service client sur port 8080, service serveur interne sur port 3001, reverse-proxy Nginx avec proxy WebSocket).
- [x] Configuration du reverse-proxy pour servir le frontend statique et relayer `/ws` et `/api`.
- [x] Harmonisation du build monorepo (compilation TypeScript de `@greek-myth/shared` en ESM).

### Tâches à venir :
- [ ] Mise en place des règles de protection de branches GitHub (Branch Protection Rules sur `main` et `dev`).
- [ ] Obligation des Pull Requests et revue de code avant tout merge.
- [ ] Pipeline CI GitHub Actions (validation automatique des builds `shared`, `server` et `client`).
- [ ] Harmonisation des conventions de nommage des branches Git (`feat/...`, `fix/...`).

---

## 5. Contrats d'interfaces et règles de collaboration

1. **Le point central est `packages/shared`** :
   - Tous les types TypeScript (structures de paquets réseau, modèles de données, énumérations) sont partagés et versionnés ici.
   - Toute modification de structure de données doit être validée en amont dans `packages/shared`.

2. **Flux Git et livraisons** :
   - La branche `main` est réservée aux livrables stables et présentations.
   - La branche `dev` centralise les développements intégrés.
   - Toute nouvelle fonctionnalité fait l'objet d'une branche dédiée (`feat/<nom-feature>`) et d'une Pull Request relue avant fusion.
