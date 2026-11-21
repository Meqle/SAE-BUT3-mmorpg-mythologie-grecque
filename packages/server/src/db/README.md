# Base de données — PostgreSQL

Pôle Base de données. Ce dossier contient tout ce qui crée et remplit la base relationnelle du jeu.

Architecture retenue : **PostgreSQL** pour les données durables, **Redis** pour le temps réel (voir `../redis/README.md`).
PostgreSQL reprend aussi ce qui était prévu dans d'autres bases, pour éviter d'en multiplier :

| Besoin | Prévu au départ dans | Fait dans PostgreSQL avec |
|---|---|---|
| Documents souples (objectifs de quête, phases de boss, statistiques d'objets, progression détaillée du personnage) | MongoDB | colonnes **JSONB** + index **GIN** |
| Relations (amis d'amis, chaînes de quêtes) | Neo4j | requêtes **récursives** (`WITH RECURSIVE`) |
| Journal des événements, détection de triche | Elasticsearch | table `journal_evenement` indexée |

| Fichier | Rôle |
|---|---|
| `schema.sql` | Crée les 21 tables, leurs contraintes, les triggers et la fonction d'échange |
| `seed.sql` | Remplit les référentiels **avec les identifiants du client** : 36 objets, 4 classes, 6 divinités, 15 zones (9 du jeu + 6 de fin de jeu), 6 boss divins, 12 quêtes et leurs prérequis |
| `demo.sql` | Données fictives : 3 joueurs, un échange prêt à tester, une guilde, des amitiés, des quêtes en cours, un extrait de journal |
| `exemples.sql` | Requêtes à montrer : récursives, JSONB, détection de force brute, preuve d'utilisation de l'index GIN |
| `roles.sql` + `04_roles.sh` | Rôles limités : le serveur ne peut ni supprimer une table, ni modifier les objets, ni effacer le journal |
| `performances.sql` | Mesures `EXPLAIN ANALYZE` sur 500 000 événements, avec et sans index |
| `sauvegarde.sh` | Sauvegarde automatique quotidienne (service `sauvegarde` de docker-compose) |

## Lancer la base

Avec Docker, à la racine du dépôt :

```bash
cp .env.example .env        # puis changer le mot de passe
docker compose up -d postgres
```

Au **premier** démarrage, Docker exécute automatiquement `schema.sql`, `seed.sql`, `demo.sql` puis `04_roles.sh`.
Ces scripts ne sont pas rejoués ensuite. Pour repartir de zéro après une modification :

```bash
docker compose down -v      # supprime aussi les données
docker compose up -d postgres
```

Se connecter à la base :

```bash
docker compose exec postgres psql -U mythologia -d mythologia
```

## Mêmes identifiants que le client

Les codes de la base sont ceux de `packages/client/src/game/data` :

| Client | Base |
|---|---|
| `HeroClassId` (`GUERRIER`…) | `classe.code` |
| `GodAffinity` (`ZEUS`…) | `divinite.code` |
| `ZoneId` (`agora`, `plaines`…) | `zone.code` |
| `ITEMS` (`epee_bronze`…) | `objet.code` |
| `QUESTS` (`mq_1_etincelle`…) | `quete.id` |

**Si le client ajoute un objet, une zone ou une quête, il faut l'ajouter dans `seed.sql`**,
sinon la sauvegarde d'un joueur qui la possède est refusée (« Objet inconnu : … »).

## La sauvegarde d'un personnage (rangement hybride)

Le jeu manipule un seul gros objet (`GameProgressState`). L'API (`../personnages`) le range ainsi :

| Partie de la sauvegarde | Rangée dans | Pourquoi |
|---|---|---|
| niveau, XP, PV, or, zone | colonnes de `personnage` | contraintes CHECK et clé étrangère vers `zone` |
| inventaire | table `instance_objet` | triggers : empilable, un objet par emplacement, échanges |
| quêtes | table `progression_quete` (+ compteurs JSONB) | trigger des prérequis, requêtes SQL possibles |
| bestiaire, compétences, codex, zones découvertes, boss vaincus… | colonne JSONB `personnage.progression` | détail qui change souvent côté jeu : pas besoin de modifier la base |

## Ce que la base garantit

Les règles importantes sont vérifiées par PostgreSQL lui-même, pas seulement par le serveur :

- un pseudo, un email et un nom de personnage sont uniques (sans tenir compte des majuscules) ;
- les PV restent entre 0 et le maximum, l'or ne devient jamais négatif ;
- un compte a au plus 5 personnages ;
- le journal des événements ne peut pas être modifié, ni effacé avant 6 mois (trigger) ;
- une épée (objet non empilable) a toujours une quantité de 1 ;
- un seul objet équipé par emplacement (deux pour les reliques), et une potion ne s'équipe pas (trigger) ;
- un échange se fait en entier ou pas du tout (`effectuer_echange`), un objet équipé ne s'échange pas ;
- pour commencer une quête, il faut avoir terminé ses quêtes prérequises (trigger) ; le niveau d'une quête est seulement conseillé, comme dans le jeu ;
- une chaîne de quêtes ne peut pas former de boucle (trigger avec requête récursive) ;
- un personnage est dans une seule guilde, et une guilde n'a qu'un seul chef (index unique partiel) ;
- pas d'amitié avec soi-même, et une seule relation par paire de joueurs, quel que soit le sens ;
- les colonnes JSONB ont la bonne forme (tableau pour les phases et les étapes, objet pour les statistiques, la progression et les compteurs).

## Rôles : le serveur n'a que les droits dont il a besoin

| Rôle | Utilisé par | Peut | Ne peut pas |
|---|---|---|---|
| `mythologia` (propriétaire) | installation, maintenance, sauvegardes | tout | — |
| `mythologia_app` | le serveur (`DATABASE_URL`) | lire tout ; écrire les données des joueurs ; **ajouter** au journal | `DROP`/`ALTER` une table, modifier les objets, quêtes et zones, modifier ou effacer le journal, créer une table |
| `mythologia_lecture` | consultation (DBeaver, statistiques) | lire | écrire, lancer un échange |

C'est le **principe du moindre privilège** : si le serveur avait une faille (injection SQL…),
un attaquant ne pourrait ni détruire la base, ni rendre son épée surpuissante, ni effacer ses traces.

```
mythologia_app> DROP TABLE personnage;              ERROR: must be owner of table personnage
mythologia_app> UPDATE objet SET statistiques = …;  ERROR: permission denied for table objet
mythologia_app> DELETE FROM journal_evenement;      ERROR: permission denied for table journal_evenement
```

Mots de passe dans `.env` : `POSTGRES_APP_PASSWORD` et `POSTGRES_LECTURE_PASSWORD`. En local, le serveur
utilise `mythologia_app` dès que `POSTGRES_APP_PASSWORD` est défini (sinon, le propriétaire, comme avant).

## Performances : les index servent-ils vraiment ?

`performances.sql` remplit la base comme après 6 mois de jeu (500 000 événements, 20 000 personnages),
chronomètre les requêtes fréquentes avec `EXPLAIN ANALYZE`, puis annule tout (`ROLLBACK`) :

```bash
docker compose exec -T postgres psql -U mythologia -d mythologia < packages/server/src/db/performances.sql
```

| Requête | Avec index | Sans index | Gain |
|---|---|---|---|
| Connexions refusées de la dernière heure (force brute) | 0,1 à 0,2 ms (Index Scan) | 20 à 45 ms (lecture des 500 000 lignes) | ≈ 100 à 400× |
| 20 derniers événements d'un joueur | 0,1 à 0,4 ms | 15 à 35 ms | ≈ 100× |
| JSONB : qui a vaincu la Sentinelle ? (valeur rare, 1/1000) | 0,1 ms (GIN) | 5 à 15 ms | ≈ 50 à 150× |
| JSONB : qui a vaincu l'Hydre ? (1/50) | 0,4 ms (GIN) | — | — |

(Fourchettes mesurées sur deux machines : les temps varient, les ordres de grandeur restent.)

**Piège rencontré : la « liste d'attente » de l'index GIN.** Mettre à jour un index GIN à chaque
insertion coûte cher ; PostgreSQL range donc d'abord les nouvelles lignes dans une liste d'attente
(*pending list*), intégrée plus tard à l'index par l'autovacuum. Juste après l'insertion massive de
20 000 personnages, cette liste n'était pas encore intégrée : la recherche devait la parcourir en entier,
et l'index GIN était **plus lent que sans index** (13,7 ms contre 5,1 ms), PostgreSQL allant même jusqu'à
l'ignorer. Le script appelle maintenant `gin_clean_pending_list()` (ce que fait l'autovacuum en
production) : la recherche passe alors à 0,1 ms. Leçon : mesurer dans des conditions réalistes, et
ne pas conclure trop vite.

## Sauvegardes

Le service `sauvegarde` de docker-compose fait une sauvegarde au démarrage puis toutes les 24 h,
dans le dossier `sauvegardes/` à la racine du dépôt, et garde 7 jours.
Ce dossier n'est jamais commité (`.gitignore`) : il contient les emails et les hash des mots de passe.

```bash
docker compose logs sauvegarde                                    # voir les sauvegardes faites
docker compose run --rm -e SAUVEGARDE_UNE_FOIS=1 sauvegarde       # sauvegarder tout de suite
```

**Restaurer** (remplace le contenu actuel de la base par celui de la sauvegarde) :

```bash
docker compose exec -T postgres pg_restore --clean --if-exists -U mythologia -d mythologia < sauvegardes/mythologia_2026-11-21_15h56.dump
```

Testé : après un `TRUNCATE compte CASCADE` (toutes les données des joueurs perdues), la restauration
remet comptes, personnages, objets, journal et droits des rôles ; l'échange de démo fonctionne ensuite.
Sur la VM, il faut aussi copier régulièrement `sauvegardes/` **ailleurs** (une sauvegarde sur la même
machine ne protège pas d'une panne de cette machine).

## Journal des événements

Le serveur écrit dans `journal_evenement` (code : `../journal/journal.ts`) :

| Type | Quand | Détails (JSONB) |
|---|---|---|
| `inscription` | création d'un compte | — |
| `connexion_reussie` / `deconnexion` | connexion, déconnexion | — |
| `connexion_refusee` | mauvais mot de passe, compte inconnu, compte banni, trop d'essais | `motif`, `identifiant_tente` si le compte n'existe pas |
| `creation_personnage` / `suppression_personnage` | API personnages | `personnage_id`, `nom`… |
| `sauvegarde_refusee` | sauvegarde rejetée par la base (3 reliques, quête sautée…) | `personnage_id`, `motif` |
| `sanction` | `npm run admin:bannir` | `action`, `motif` |

- Écrire dans le journal ne bloque jamais le joueur : si l'écriture échoue, l'action continue.
- Le journal est **infalsifiable** (trigger `journal_infalsifiable`) : une ligne ne peut être ni modifiée
  ni supprimée, sauf après 6 mois (on ne garde pas les adresses IP indéfiniment).
- Le mot de passe n'est **jamais** écrit dans le journal.

Rapport de sécurité (rafales de connexions refusées, comptes visés, sauvegardes refusées) :

```bash
npm run admin:journal           # dernières 24 heures
npm run admin:journal -- 168    # 7 derniers jours
```

⚠️ Derrière Nginx, l'adresse enregistrée est celle de Nginx tant que le serveur n'a pas
`app.set('trust proxy', 1)` et que Nginx n'envoie pas `X-Forwarded-For` (à régler avec le pôle réseau).

## Tester l'échange de démonstration

```sql
SELECT effectuer_echange(1);   -- Persée donne son bouclier et 50 drachmes, Atalante ses éclats de foudre
SELECT * FROM v_classement_saison;
```

## Lancer les requêtes d'exemple

Depuis la racine du dépôt, la base étant lancée :

```bash
docker compose exec -T postgres psql -U mythologia -d mythologia < packages/server/src/db/exemples.sql
```

On y voit notamment les quêtes débloquées par une quête (récursif), les « amis d'amis » de Persée,
les quêtes où il faut vaincre le Minotaure (JSONB), qui a vaincu le Gardien d'Airain (JSONB de progression),
l'équipement porté par Persée et la rafale de 12 connexions refusées en une minute (journal).

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

## Lien avec Redis

- Redis garde les données qui vivent peu de temps : sessions ouvertes, compteur d'essais de connexion, classement en direct.
- La position en direct reste dans le serveur de jeu ; `personnage.position_x/y` n'en est qu'une sauvegarde.
- PostgreSQL reste la référence : Redis n'utilise que des identifiants qui existent dans PostgreSQL.
