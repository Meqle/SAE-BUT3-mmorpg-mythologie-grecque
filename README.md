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

# Lancement du serveur et du client en développement
npm run dev
```

Le client est disponible sur `http://localhost:5173` et le serveur écoute sur le port `3001`.
Ouvrez le jeu dans deux fenêtres ou navigateurs, puis entrez dans la même salle pour vérifier
la connexion et la synchronisation des joueurs.

## Lancement avec Docker

Prérequis : Docker Desktop (ou Docker Engine avec le plugin Docker Compose).

```bash
# Construire les images et démarrer le serveur et le client
docker compose up --build
```

Ouvrez `http://localhost:8080` dans deux fenêtres ou navigateurs et choisissez la même salle.
Le port du serveur n'est pas publié sur l'hôte : seul le client/Nginx est exposé, et relaie les
requêtes HTTP et WebSocket vers le serveur sur le réseau Docker. Pour arrêter les conteneurs :

```bash
docker compose down
```

Pour tester depuis un autre appareil de votre réseau local, ouvrez `http://<IP_LOCALE_DU_PC>:8080`.
Le pare-feu du PC doit autoriser le port choisi par `CLIENT_PORT` (8080 par défaut).

### Hébergement public et sécurité

Ne publiez pas directement le port HTTP 8080 sur Internet. Placez un reverse proxy avec un
certificat TLS devant le service client afin que les joueurs utilisent HTTPS et WSS. Configurez
ensuite `ALLOWED_ORIGINS` avec l'origine exacte du site, par exemple
`https://jeu.exemple.fr` (sans chemin), puis redémarrez Compose. La même origine sert le client et
le WebSocket.

Ce serveur est un prototype anonyme : les pseudonymes et la divinité ne sont pas authentifiés,
et les salles/états sont perdus au redémarrage. Avant une ouverture publique, ajoutez le flux de
comptes et de jetons d'accès, des limites anti-abus adaptées à l'hébergement ainsi que la
persistance des personnages. Les contrôles de messages, limites de taille, cadence, connexions
et joueurs par salle déjà en place ne remplacent pas l'authentification ni TLS.


## Organisation Git

- `main` : Branche principale de production.
- `dev` : Branche d'intégration des fonctionnalités.
- Branches par fonctionnalité : `feat/<nom-fonctionnalite>`, `fix/<nom-correctif>`.
