# Feuille de route et planification du projet (SAE BUT3)

Ce document détaille la répartition des tâches, l'état d'avancement et les contrats d'interfaces entre les trois pôles du projet.

---

## 1. Pôle Développement (Client & Moteur de jeu)

Responsable : Développement frontend, moteur 2D, interface et rendu.
Dossier principal : `packages/client/`

### Tâches réalisées :
- [x] Initialisation de l'arborescence monorepo et configuration TypeScript / Vite.
- [x] Écran titre et interface du Lobby (sélection de serveur et de divinité tutélaire).
- [x] Intégration du moteur PixiJS dans React.
- [x] Déplacement de base en vue du dessus (8 directions, vélocité, caméra fluide).
- [x] Prototype de transition vers la vue de profil (gravité, plateformes, saut).

### Tâches à venir :
- [ ] Remplacer les formes géométriques par des spritesheets 2D (héros, décors du mont Olympe).
- [ ] Système d'animations (marche, saut, idle, compétences).
- [ ] Gestion des masques de collision (tilesets / obstacles de la carte).
- [ ] Interface en jeu (HUD : barre de vie, niveau, endurance, chat).
- [ ] Intégration du client réseau (écoute des événements WebSocket fournis par le pôle Réseau).
- [ ] Packaging Desktop en fin de projet (intégration Tauri / Electron pour générer l'exécutable).

---

## 2. Pôle Réseau (Architecture Client-Serveur & Synchronisation)

Responsable : Communication temps réel, synchronisation d'état et gestion des instances.
Dossier principal : `packages/server/`

### Tâches à réaliser :
- [ ] Mise en place du serveur WebSocket (ex: `ws` ou `socket.io`).
- [ ] Définition de la boucle de jeu serveur (tickrate à 20 ou 30 Hz).
- [ ] Gestion des salles / rooms (instanciation d'un monde : Olympe, Élysée, Tartare).
- [ ] Réception des inputs clients (déplacements) et validation côté serveur (anti-triche).
- [ ] Diffusion de l'état du monde (`WORLD_TICK`) à tous les clients connectés.
- [ ] Gestion des déconnexions et reconnexions.
- [ ] Implémentation du système de chat textuel entre joueurs de la même salle.

---

## 3. Pôle Base de Données (Persistance & API REST)

Responsable : Modélisation des données, persistance et sécurité des comptes.
Dossier principal : `packages/server/` (dossiers `db/`, `models/`, `routes/`)

### Tâches à réaliser :
- [ ] Conception du schéma relationnel (MCD/MLD) :
  - Table `users` (id, email, mot de passe haché, date de création).
  - Table `characters` (id, user_id, nom, dieu_tutelaire, niveau, pv, position_x, position_y, salle_actuelle).
  - Table `inventories` & `items` (si gestion d'équipement/objets).
- [ ] Choix de la technologie (PostgreSQL recommandé + ORM Prisma ou Drizzle).
- [ ] Création des migrations SQL et scripts de seed.
- [ ] Développement de l'API REST d'authentification :
  - `POST /api/auth/register` (création de compte sécurisée avec bcrypt).
  - `POST /api/auth/login` (vérification des identifiants et génération de token JWT).
  - `GET /api/characters` (récupération des personnages du joueur connecté).
- [ ] Mise en place d'un cache optionnel (Redis) pour la liste des serveurs ou sessions actives.

---

## 4. Contrats d'interfaces et travail en équipe

Pour que chaque membre puisse avancer de manière autonome (et éventuellement s'aider d'un assistant de code) sans casser le travail des autres :

1. **Le point central est `packages/shared`** :
   - Tous les types TypeScript (structures des paquets réseau, modèles de données d'un joueur, liste des dieux) doivent être définis dans ce dossier.
   - Avant de coder une fonctionnalité réseau ou base de données, valider les types partagés ensemble.

2. **Indépendance des modules** :
   - Le pôle **Développement** écoute des événements (ex: `onPlayerMoved`, `onWorldUpdate`) sans dépendre de l'implémentation interne du serveur.
   - Le pôle **Réseau** manipule des états en mémoire sans avoir besoin de connaître le rendu PixiJS.
   - Le pôle **Base de données** expose des fonctions d'accès aux données (ou routes REST) consommées par le serveur de jeu.
