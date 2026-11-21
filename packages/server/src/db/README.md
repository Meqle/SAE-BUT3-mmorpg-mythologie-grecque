# Base de données — PostgreSQL

Pôle Base de données. Ce dossier contient tout ce qui crée et remplit la base relationnelle du jeu.

| Fichier | Rôle |
|---|---|
| `schema.sql` | Crée les 15 tables, leurs contraintes, les triggers et la fonction d'échange |
| `seed.sql` | Remplit les référentiels : 4 classes, 6 divinités, 7 zones, 6 boss, 9 objets |
| `demo.sql` | Données fictives pour le développement : 2 joueurs et un échange prêt à tester |

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
- un échange se fait en entier ou pas du tout (`effectuer_echange`), un objet équipé ne s'échange pas.

## Tester l'échange de démonstration

```sql
SELECT effectuer_echange(1);   -- Persée donne son bouclier et 50 pièces, Atalante ses éclats de foudre
SELECT * FROM v_classement_saison;
```

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

## Lien avec les autres bases

- `progression_quete.quete_id` pointe vers un document de quête dans **MongoDB**.
- Le détail des objets et des attaques des boss ira aussi dans MongoDB.
- La position en direct reste dans le serveur de jeu (puis Redis) ; `personnage.position_x/y` n'est qu'une sauvegarde.
