# Redis — base en mémoire

Pôle Base de données. Redis garde les données qui vivent **quelques secondes ou quelques heures**.
PostgreSQL reste la référence pour tout ce qui doit durer.

| Usage | Clé Redis | Structure | Fichier |
|---|---|---|---|
| Sessions ouvertes (un jeton = une session) | `session:<jti>` | chaîne + durée de vie (TTL 2 h) | `sessions.ts` |
| Sessions d'un compte (pour tout fermer d'un coup) | `sessions:compte:<id>` | ensemble (*set*) | `sessions.ts` |
| Échecs de connexion récents | `connexion:echecs:compte:<id>` | compteur `INCR` + `EXPIRE` (5 min) | `antiForceBrute.ts` |
| Classement en direct d'une saison | `classement:saison:<n>` | *sorted set* (score = points) | `classement.ts` |

## Ce que ça apporte

- **Déconnexion réelle** (`POST /api/auth/logout`) : la session est supprimée, le jeton ne sert plus à rien.
- **Bannissement immédiat** : `npm run admin:bannir -- <pseudo>` ferme toutes les sessions du compte.
  Sans Redis, un joueur banni garderait son jeton jusqu'à 2 heures.
- **Anti force brute** : après 5 mauvais mots de passe sur un compte, la connexion est bloquée 5 minutes (code 429).
- **Classement en direct** : `GET /api/classement?saison=1&limite=10`, toujours trié, instantané.

## Rôle de chaque base pour le classement

- Redis tient le classement **en direct** (`ZINCRBY` pour ajouter des points, `ZREVRANGE` pour le top).
- PostgreSQL (`classement_saison`) en garde la **sauvegarde** (`sauvegarderDansPostgres`).
- Si la clé Redis n'existe pas, elle est rechargée depuis PostgreSQL : c'est le principe du **cache-aside**.

## Si Redis tombe en panne

Les routes qui en ont besoin répondent **503** (« service temporairement indisponible ») au lieu de planter,
et le serveur se reconnecte tout seul quand Redis revient. On refuse les connexions plutôt que d'accepter
des jetons qu'on ne peut plus vérifier : la sécurité passe avant la disponibilité.

Redis est lancé avec `--appendonly yes` : il écrit aussi sur disque, les sessions survivent à un redémarrage.

## Commandes utiles

```bash
docker compose up -d redis                     # lancer Redis seul
npm run db:verifier                            # vérifie PostgreSQL ET Redis
docker compose exec redis redis-cli -a <mot de passe> --no-auth-warning
```

Dans `redis-cli` :

```
KEYS session:*                                  # sessions ouvertes (à éviter en production)
TTL session:<jti>                               # secondes avant expiration
ZREVRANGE classement:saison:1 0 9 WITHSCORES    # top 10
GET connexion:echecs:compte:3                   # échecs récents du compte 3
```

## À faire côté réseau

Derrière Nginx, le serveur ne voit pas la vraie adresse IP des joueurs (il voit celle de Nginx).
C'est pourquoi l'anti force brute compte les échecs **par compte** et pas par adresse.
Pour bloquer aussi par adresse, il faudra ajouter dans `nginx.conf`
`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` et dans le serveur `app.set('trust proxy', 1)`.
