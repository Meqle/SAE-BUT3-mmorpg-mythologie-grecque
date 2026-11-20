# SAE BUT3 - MMORPG 2D (Mythologie Grecque)

Projet universitaire réalisé dans le cadre du BUT3 Informatique. Le projet consiste en un jeu de rôle multijoueur en 2D en ligne inspiré de la mythologie grecque, associant une vue de dessus et des phases de vue de profil (plateforme).

## Répartition des responsabilités

- **Développement** : Interface utilisateur (Lobby, HUD, inventaire, talents, cartes), moteur de jeu 2D (PixiJS), zones, quêtes, combats, craft et physique double vue.
- **Réseau** : Serveur WebSocket temps réel, synchronisation de l'état du monde, gestion des salles et des connexions.
- **Base de données** : Modélisation et persistance PostgreSQL + NoSQL (MongoDB), API REST d'authentification et sauvegarde de progression.

## Architecture du projet

Le projet est configuré en monorepo :
- `packages/client` : Application cliente (React 18, Vite, PixiJS v8).
- `packages/server` : Serveur de jeu (Node.js, WebSocket) et scripts SQL (`src/db/`).
- `packages/shared` : Types TypeScript et contrats d'interfaces partagés.

## Contenu jouable (client)

- **4 classes** (*Guerrier, Archer, Mage, Assassin*) aux visuels et styles d'attaque distincts, et **6 divinités** (*Zeus, Poséidon, Hadès, Athéna, Arès, Apollon*).
- **9 zones** : *Cité de l'Agora* (avec 3 intérieurs visitables : Taverne, Forge, Infirmerie), *Plaines Foudroyées*, *Sanctuaire Brisé*, *Rivage d'Égée* (vue de profil), *Labyrinthe des Brumes* et *Marécages de Lerne*.
- **Systèmes RPG** : 6 quêtes principales + 6 secondaires, 4 boss multi-patterns, drops par rareté, fiche personnage & sac en grille, craft (poche vs ateliers PNJ), double arbre de talents libre jusqu'au niveau 40, bestiaire, minimap et carte interactive.

### Contrôles par défaut (reconfigurables via `Échap`)

| Action | Touche par défaut |
| :--- | :--- |
| Se déplacer | `Z Q S D` ou Flèches |
| Attaque principale | `Clic gauche` |
| Pouvoir divin | `Clic droit` |
| Esquive / Saut (vue de profil) | `Maj` / `Espace` |
| Compétences actives débloquées | `1` `2` `3` `4` |
| Interagir / Parler / Boire potion | `E` / `R` |
| Sac / Talents / Quêtes / Codex / Carte | `I` / `T` / `L` / `C` / `M` |
| Menu Pause, Paramètres & Bestiaire | `Échap` |

## Installation et exécution

```bash
# Installation des dépendances
npm install

# Lancement du serveur et du client en développement
npm run dev
```

Le client est disponible sur `http://localhost:5173` et le serveur écoute sur le port `3001`.

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
persistance des personnages.

## Organisation Git

- `main` : Branche principale stable.
- `dev` : Branche d'intégration des fonctionnalités.
- Branches de travail : `feat/<nom-fonctionnalite>`, `fix/<nom-correctif>`, `docs/<sujet>`.
- Les branches fusionnées par Pull Request doivent être supprimées (sur GitHub et en local) pour garder le dépôt propre.
