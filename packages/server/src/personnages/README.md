# API des personnages et de la sauvegarde

Pôle Base de données. Remplace la sauvegarde dans le navigateur (`localStorage`)
par une sauvegarde dans PostgreSQL, liée au compte du joueur.

Toutes les routes demandent d'être connecté : en-tête `Authorization: Bearer <jeton>`
(jeton reçu par `POST /api/auth/login`). Un joueur ne voit et ne modifie **que ses propres personnages**.

| Route | Corps envoyé | Réponse |
|---|---|---|
| `GET /api/characters` | — | `200 { personnages: [{ id, heroName, heroClass, god, level, zoneId, savedAt }] }` |
| `POST /api/characters` | `{ heroName, heroClass, god }` | `201 { personnage }` (état de départ) |
| `GET /api/characters/:id` | — | `200 { personnage }` |
| `PUT /api/characters/:id/save` | l'état du jeu + `maxHp` | `200 { savedAt }` |
| `DELETE /api/characters/:id` | — | `204` |

`personnage` a **la même forme que `GameProgressState`** (heroName, heroClass, god, level, xp, hp,
gold, zoneId, inventory, quests, bestiaryKills…), plus `id`, `maxHp`, `position` et `savedAt`.
Les 12 quêtes sont toujours toutes présentes, avec le bon statut (`locked` / `available` / `active` / `ready` / `completed`).

## Brancher le client (pour le pôle client / réseau)

Trois changements dans `packages/client/src/game/state/gameState.ts` suffisent :

```ts
const API = '/api/characters';
const entetes = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${jetonDuJoueur}` // reçu à la connexion
});

// 1. Création : le serveur crée le héros, puis on envoie l'état de départ du jeu
const { personnage } = await (await fetch(API, {
  method: 'POST', headers: entetes(),
  body: JSON.stringify({ heroName, heroClass, god })
})).json();
const etat = createNewGameState(heroName, heroClass, god);
await sauvegarder(personnage.id, etat);

// 2. Sauvegarde (à la place de localStorage.setItem)
async function sauvegarder(id: number, state: GameProgressState) {
  await fetch(`${API}/${id}/save`, {
    method: 'PUT', headers: entetes(),
    body: JSON.stringify({ ...state, maxHp: getComputedStats(state).maxHp })
  });
}

// 3. Chargement (à la place de localStorage.getItem)
const { personnage } = await (await fetch(`${API}/${id}`, { headers: entetes() })).json();
```

Conseils :

- **`maxHp` est obligatoire** dans la sauvegarde : la base vérifie que `hp <= maxHp`.
- Le jeu sauvegarde souvent (`syncUi(true)`) : regrouper les appels (par exemple au plus une
  sauvegarde toutes les 5 secondes, plus une à la fermeture de l'onglet) évite de charger le serveur.
- Si une sauvegarde est refusée (code 400), le message `erreur` dit quelle règle est violée.
  C'est le signe d'un bug ou d'une triche : la sauvegarde précédente reste intacte.

## Ce que la base refuse (et le code renvoyé)

| Situation | Code | Message |
|---|---|---|
| Nom de héros déjà pris (sans tenir compte des majuscules) | 409 | Ce nom de héros est déjà pris. |
| 6e personnage sur un compte | 400 | Un compte ne peut pas avoir plus de 5 personnages |
| 3 reliques ou 2 armes équipées | 400 | Emplacement « relique » déjà occupé… |
| Potion ou ressource équipée | 400 | L'objet potion_ambroisie ne s'équipe pas |
| 5 épées sur une même ligne | 400 | L'objet epee_bronze n'est pas empilable |
| Quête commencée sans avoir fini la précédente | 400 | La quête mq_4_rivage_epreuve doit d'abord être terminée |
| PV au-dessus du maximum | 400 | règle personnage_pv_max |
| Objet, zone ou quête inconnus | 400 | Objet inconnu : … |
| Objet engagé dans un échange retiré de l'inventaire | 409 | Un objet de ce personnage est engagé dans un échange… |
| Personnage d'un autre joueur | 404 | Personnage introuvable. |

Chaque sauvegarde est **une transaction** : soit tout est enregistré, soit rien.

## Fichiers

| Fichier | Rôle |
|---|---|
| `routes.ts` | Les 5 routes : vérification de la forme des données (Zod), codes d'erreur |
| `sauvegarde.ts` | Lecture et écriture dans PostgreSQL (transaction, ordre des quêtes, inventaire) |

Le détail du rangement dans les tables est expliqué dans `../db/README.md`.

## Tester à la main

```bash
# Se connecter (compte créé avec /api/auth/register) et garder le jeton
JETON=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"identifiant":"MonPseudo","motDePasse":"monmotdepasse"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).jeton")

curl -s -X POST http://localhost:3001/api/characters -H "Authorization: Bearer $JETON" \
  -H "Content-Type: application/json" -d '{"heroName":"Thésée","heroClass":"GUERRIER","god":"POSEIDON"}'
curl -s http://localhost:3001/api/characters -H "Authorization: Bearer $JETON"
```
