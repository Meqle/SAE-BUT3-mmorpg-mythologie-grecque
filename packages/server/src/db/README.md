# Base de données — PostgreSQL

Pôle Base de données. Ce dossier contient tout ce qui crée et remplit la base relationnelle du jeu.

Architecture retenue : **PostgreSQL** pour les données durables, **Redis** pour le temps réel (à venir).
PostgreSQL reprend aussi ce qui était prévu dans d'autres bases, pour éviter d'en multiplier :

| Besoin | Prévu au départ dans | Fait dans PostgreSQL avec |
|---|---|---|
| Documents souples (étapes de quête, phases de boss, statistiques d'objets) | MongoDB | colonnes **JSONB** + index **GIN** |
| Relations (amis d'amis, chaînes de quêtes) | Neo4j | requêtes **récursives** (`WITH RECURSIVE`) |
| Journal des événements, détection de triche | Elasticsearch | table `journal_evenement` indexée |

| Fichier | Rôle |
|---|---|
| `schema.sql` | Crée les 21 tables, leurs contraintes, les triggers et la fonction d'échange |
| `seed.sql` | Remplit les référentiels : 4 classes, 6 divinités, 7 zones, 6 boss (avec leurs phases), 9 objets, 6 quêtes et leurs prérequis |
| `demo.sql` | Données fictives : 3 joueurs, un échange prêt à tester, une guilde, des amitiés, des quêtes en cours, un extrait de journal |
| `exemples.sql` | Requêtes à montrer : récursives, JSONB, détection de force brute, preuve d'utilisation de l'index GIN |

## Lancer la base

Avec Docker, à la racine du dépôt :

```bash
cp .env.example .env        # puis changer le mot de passe
docker compose up -d postgres
```

Au **premier** démarrage, Docker exécute automatiquement `schema.sql`, `seed.sql` puis `demo.sql`.
Ces scripts ne sont pas rejoués ensuite. Pour repartir de zéro après une modification :

```bash
docker compose down -v      # supprime aussi les données
docker compose up -d postgres
```

Se connecter à la base :

```bash
docker compose exec postgres psql -U mythologia -d mythologia
```

## Ce que la base garantit

Les règles importantes sont vérifiées par PostgreSQL lui-même, pas seulement par le serveur :

- un pseudo, un email et un nom de personnage sont uniques (sans tenir compte des majuscules) ;
- les PV restent entre 0 et le maximum, l'or ne devient jamais négatif ;
- un compte a au plus 5 personnages ;
- une épée (objet non empilable) a toujours une quantité de 1 ;
- un échange se fait en entier ou pas du tout (`effectuer_echange`), un objet équipé ne s'échange pas ;
- pour commencer une quête, il faut le niveau requis et avoir terminé ses quêtes prérequises (trigger) ;
- une chaîne de quêtes ne peut pas former de boucle (trigger avec requête récursive) ;
- un personnage est dans une seule guilde, et une guilde n'a qu'un seul chef (index unique partiel) ;
- pas d'amitié avec soi-même, et une seule relation par paire de joueurs, quel que soit le sens ;
- les colonnes JSONB ont la bonne forme (tableau pour les phases et les étapes, objet pour les statistiques).

## Tester l'échange de démonstration

```sql
SELECT effectuer_echange(1);   -- Persée donne son bouclier et 50 pièces, Atalante ses éclats de foudre
SELECT * FROM v_classement_saison;
```

## Lancer les requêtes d'exemple

Depuis la racine du dépôt, la base étant lancée :

```bash
docker compose exec -T postgres psql -U mythologia -d mythologia < packages/server/src/db/exemples.sql
```

On y voit notamment les quêtes débloquées par une quête (récursif), les « amis d'amis » de Persée,
les quêtes contenant un combat (JSONB) et la rafale de 12 connexions refusées en une minute (journal).

## Utiliser la base depuis le serveur (TypeScript)

| Fichier | Rôle |
|---|---|
| `client.ts` | Ouvre la connexion (un *pool* de connexions) et exporte `db` |
| `schema.ts` | Décrit les tables pour Drizzle, afin d'écrire des requêtes typées |
| `requetes.ts` | Fonctions prêtes à l'emploi : lister les classes, les personnages d'un compte, faire un échange... |
| `verifier.ts` | Script de vérification de la connexion |

Le reste du serveur n'écrit pas de SQL : il importe les fonctions de `requetes.ts`.

```ts
import { listerPersonnagesDuCompte } from './db/requetes.js';
const personnages = await listerPersonnagesDuCompte(1);
```

Vérifier que le serveur arrive à joindre la base (la base doit tourner dans Docker) :

```bash
npm run db:verifier
```

En local, la connexion utilise les valeurs du fichier `.env` à la racine (dont `POSTGRES_PORT`).
Dans Docker, elle utilise `DATABASE_URL`, définie dans `docker-compose.yml`.

`schema.sql` reste la référence : si on le modifie, il faut mettre `schema.ts` à jour en même temps.

## Lien avec Redis (à venir)

- Redis gardera les données qui vivent peu de temps : joueurs connectés, jetons révoqués, compteur d'essais de connexion, classement en direct.
- La position en direct reste dans le serveur de jeu ; `personnage.position_x/y` n'en est qu'une sauvegarde.
- PostgreSQL reste la référence : Redis n'utilise que des identifiants qui existent dans PostgreSQL.
