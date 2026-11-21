// Sessions de connexion (liste des jetons encore valides).
//
// Problème : un jeton JWT reste valable jusqu'à son expiration, même si on
// banni le joueur ou s'il se déconnecte. Solution : chaque jeton reçoit un
// identifiant unique (jti). À la connexion, on enregistre « session:<jti> »
// dans Redis avec la même durée de vie que le jeton. À chaque requête, on
// vérifie que la session existe encore. Supprimer la clé = révoquer le jeton.
//
// Clés utilisées :
//   session:<jti>             -> id du compte          (expire avec le jeton)
//   sessions:compte:<id>      -> ensemble des jti      (pour tout révoquer d'un coup)
import { avecRedis, redis } from './client.js';

const cleSession = (jti: string) => `session:${jti}`;
const cleSessionsDuCompte = (compteId: number) => `sessions:compte:${compteId}`;

export async function creerSession(jti: string, compteId: number, dureeSecondes: number): Promise<void> {
  // MULTI / EXEC : les trois commandes sont exécutées ensemble.
  await avecRedis(() =>
    redis
      .multi()
      .set(cleSession(jti), String(compteId), 'EX', dureeSecondes)
      .sadd(cleSessionsDuCompte(compteId), jti)
      .expire(cleSessionsDuCompte(compteId), dureeSecondes)
      .exec()
  );
}

export async function sessionActive(jti: string, compteId: number): Promise<boolean> {
  const valeur = await avecRedis(() => redis.get(cleSession(jti)));
  return valeur === String(compteId);
}

export async function supprimerSession(jti: string, compteId: number): Promise<void> {
  await avecRedis(() => redis.multi().del(cleSession(jti)).srem(cleSessionsDuCompte(compteId), jti).exec());
}

// Ferme toutes les sessions d'un compte (ex. quand il est banni).
// Renvoie le nombre de sessions encore actives qui ont été fermées.
export async function revoquerSessionsDuCompte(compteId: number): Promise<number> {
  return avecRedis(async () => {
    const jtis = await redis.smembers(cleSessionsDuCompte(compteId));
    if (jtis.length === 0) return 0;
    const fermees = await redis.del(...jtis.map(cleSession));
    await redis.del(cleSessionsDuCompte(compteId));
    return fermees;
  });
}
