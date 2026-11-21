// Protection contre les attaques par force brute sur la connexion.
//
// Un attaquant qui essaie des milliers de mots de passe sur un même compte
// est bloqué après MAX_ECHECS échecs, pendant FENETRE_SECONDES.
//
// Technique Redis classique : un compteur (INCR) qui disparaît tout seul
// (EXPIRE). Pas besoin de nettoyer : Redis supprime la clé à la fin du délai.
//
// Clé utilisée :
//   connexion:echecs:compte:<id>          -> nombre d'échecs récents sur un compte
//   connexion:echecs:inconnu:<identifiant> -> idem pour un pseudo/email inexistant
//
// Remarque : on compte par COMPTE et pas par adresse IP, car derrière Nginx
// le serveur ne voit pas encore la vraie adresse des joueurs (à configurer
// côté réseau avec l'en-tête X-Forwarded-For).
import { avecRedis, redis } from './client.js';

export const MAX_ECHECS = 5;
export const FENETRE_SECONDES = 300; // 5 minutes

export function cleEchecs(compteId: number | null, identifiant: string): string {
  return compteId !== null
    ? `connexion:echecs:compte:${compteId}`
    : `connexion:echecs:inconnu:${identifiant.trim().toLowerCase()}`;
}

// Nombre de secondes pendant lesquelles la connexion est encore bloquée (0 = pas bloquée).
export async function secondesDeBlocage(cle: string): Promise<number> {
  return avecRedis(async () => {
    const [nombre, restant] = await Promise.all([redis.get(cle), redis.ttl(cle)]);
    return Number(nombre ?? 0) >= MAX_ECHECS ? Math.max(restant, 1) : 0;
  });
}

// Ajoute un échec et renvoie le total sur la fenêtre en cours.
export async function enregistrerEchec(cle: string): Promise<number> {
  return avecRedis(async () => {
    const resultats = await redis.multi().incr(cle).expire(cle, FENETRE_SECONDES, 'NX').exec();
    return Number(resultats?.[0]?.[1] ?? 0);
  });
}

// Connexion réussie : on repart de zéro.
export async function effacerEchecs(cle: string): Promise<void> {
  await avecRedis(() => redis.del(cle));
}
