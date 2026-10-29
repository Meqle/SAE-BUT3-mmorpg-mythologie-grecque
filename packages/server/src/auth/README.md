# API d'authentification

Pôle Base de données. Permet aux joueurs de créer un compte, de se connecter et de prouver qui ils sont.

## Fonctionnement

```
Inscription   pseudo + email + mot de passe  ->  hachage Argon2id  ->  table COMPTE  ->  jeton
Connexion     pseudo (ou email) + mot de passe  ->  vérification     ->  jeton
Ensuite       le client envoie le jeton dans l'en-tête Authorization à chaque requête
```

| Route | Corps de la requête | Réponse |
|---|---|---|
| `POST /api/auth/register` | `{ "email", "pseudo", "motDePasse" }` | `201 { jeton, compte }` |
| `POST /api/auth/login` | `{ "identifiant", "motDePasse" }` (pseudo ou email) | `200 { jeton, compte }` |
| `GET /api/auth/me` | en-tête `Authorization: Bearer <jeton>` | `200 { compte }` |

En cas d'erreur, la réponse contient `{ "erreur": "message lisible" }` :

| Code | Cas |
|---|---|
| 400 | Données invalides (pseudo trop court, email mal formé, mot de passe de moins de 8 caractères) |
| 401 | Identifiant ou mot de passe incorrect, jeton absent ou expiré |
| 403 | Compte banni |
| 409 | Pseudo ou email déjà utilisé |
| 503 | Base de données injoignable |

Le jeton est valable 2 heures. Le hash du mot de passe n'est jamais renvoyé au client.

## Sécurité

- Mots de passe hachés avec **Argon2id** (réglages OWASP) : jamais stockés en clair.
- Même message d'erreur que le pseudo soit inconnu ou le mot de passe faux, et même temps de réponse : on ne révèle pas quels comptes existent.
- Jetons **JWT** signés avec `JWT_SECRET` : un jeton modifié est refusé.
- L'unicité du pseudo et de l'email est garantie par la base (index `UNIQUE` insensibles à la casse).

## Configuration

Dans le `.env` à la racine, définir un secret d'au moins 32 caractères. Pour en générer un :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Sans `JWT_SECRET`, le serveur utilise en développement un secret temporaire (il faut se reconnecter après chaque redémarrage). En production, la connexion est refusée.

## Tester à la main (Git Bash)

La base doit tourner (`docker compose up -d postgres`) et le serveur aussi (`npm run dev:server`).

```bash
# Inscription
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" \
  -d '{"email":"test@exemple.fr","pseudo":"Heracles","motDePasse":"olympe2026"}'

# Connexion (copier le jeton de la réponse)
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"identifiant":"Heracles","motDePasse":"olympe2026"}'

# Compte connecté
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer COLLER_LE_JETON_ICI"
```

## Pour protéger une autre route

```ts
import { exigerConnexion } from './auth/routes.js';

app.get('/api/characters', exigerConnexion, (req, res) => {
  const compteId = res.locals.compteId; // le compte connecté
});
```
