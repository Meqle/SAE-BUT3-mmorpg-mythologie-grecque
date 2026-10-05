# SAE BUT3 - MMORPG 2D (Mythologie Grecque)

Projet universitaire réalisé dans le cadre du BUT3 Informatique. Le projet consiste en un jeu de rôle multijoueur en 2D en ligne inspiré de la mythologie grecque, associant une vue de dessus et des phases de vue de profil (plateforme).

## Répartition des responsabilités

- **Développement** : Interface utilisateur (Lobby, menus), moteur de jeu 2D (PixiJS), contrôles du personnage, physique et transitions de vue.
- **Réseau** : Serveur WebSocket temps réel, synchronisation de l'état du monde, gestion des salles et des connexions.
- **Base de données** : Modélisation des données (PostgreSQL), persistance des comptes et des personnages, API d'authentification.

## Architecture du projet

Le projet est configuré en monorepo :
- `packages/client` : Application cliente (React, Vite, PixiJS).
- `packages/server` : Serveur de jeu (Node.js, WebSocket).
- `packages/shared` : Types TypeScript et contrats d'interfaces partagés.

## Installation et exécution

```bash
# Installation des dépendances
npm install

# Lancement du client (Développement)
npm run dev:client

# Lancement du serveur (Réseau)
npm run dev:server
```

## Organisation Git

- `main` : Branche principale de production.
- `dev` : Branche d'intégration des fonctionnalités.
- Branches par fonctionnalité : `feat/<nom-fonctionnalite>`, `fix/<nom-correctif>`.
