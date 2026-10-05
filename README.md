# ⚡ Mythologia 2D - MMORPG (Projet BUT3 Informatique)

Projet de jeu de rôle massivement multijoueur en 2D sur navigateur, développé dans le cadre du **BUT3 Informatique**. Le jeu plonge les joueurs dans la **mythologie grecque** (Olympe, Élysée, Tartare) avec un système de déplacement hybride (vue du dessus / vue de profil).

---

## 🏛️ Répartition des Pôles BUT3

| Pôle | Responsabilités clés | Technologies |
| :--- | :--- | :--- |
| **🎮 Développement** | Interface Lobby / Écran titre, moteur de rendu 2D (PixiJS), contrôles joueur, transitions de vue, animations | **TypeScript, React, PixiJS, Vite** |
| **🌐 Réseau** | Architecture Client-Serveur temps réel, synchronisation des états (tick loop, interpolation), gestion des rooms/mondes, protocole WebSocket | **Node.js, WebSockets / Socket.io, TypeScript** |
| **💾 Base de Données** | Persistance des comptes, personnages, inventaires, progression, logs d'activités, caching de session | **PostgreSQL, Prisma ORM, Redis** |

---

## 📁 Architecture du Monorepo

```text
greek-myth-mmo/
├── packages/
│   ├── shared/     # Types communs, protocoles de messages réseau, constantes du lore
│   ├── server/     # Serveur de jeu WebSocket, API REST d'authentification, ORM BDD
│   └── client/     # Interface utilisateur (Lobby / HUD) + Moteur de rendu PixiJS
├── package.json    # Configuration des npm workspaces
└── README.md
```

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (version 18+ ou 20+ recommandée)
- `npm` (installé par défaut avec Node.js)

### Installation
```bash
# À la racine du projet, installer toutes les dépendances du monorepo
npm install
```

### Lancement en mode développement
```bash
# Lance le serveur et le client simultanément
npm run dev

# Ou lancer individuellement :
npm run dev:client   # Lance Vite sur http://localhost:5173
npm run dev:server   # Lance le serveur de jeu WebSocket
```

---

## 🌿 Règles de collaboration Git pour l'équipe

1. **Branche principale (`main`)** : Code stable et déployable uniquement. Aucun commit direct.
2. **Branche d'intégration (`dev`)** : Branche où toutes les fonctionnalités sont regroupées et testées ensemble.
3. **Branches de fonctionnalités (`feat/...`, `fix/...`)** :
   - `feat/lobby-ui` : Création de l'interface de connexion et sélection de serveur.
   - `feat/pixi-movement` : Implémentation du moteur PixiJS et du déplacement.
   - `feat/network-sync` : Gestion des paquets réseau et de la boucle serveur.
   - `feat/db-auth` : Modèles Prisma et routes d'authentification.
4. **Commits conventionnels** : Utiliser des préfixes clairs (`feat:`, `fix:`, `docs:`, `refactor:`, `style:`).
