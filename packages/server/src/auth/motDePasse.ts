// Hachage des mots de passe avec Argon2id.
//
// Un hachage est à sens unique : on ne peut pas retrouver le mot de passe à
// partir du hash. Pour vérifier une connexion, on hache le mot de passe tapé
// et on compare. Argon2id est volontairement lent et gourmand en mémoire,
// ce qui rend très coûteuse une attaque qui essaierait des millions de mots
// de passe. Chaque hash contient aussi un "sel" aléatoire : deux joueurs avec
// le même mot de passe n'ont pas le même hash.
import { hash, verify } from '@node-rs/argon2';

// Réglages recommandés par l'OWASP pour Argon2id (19 Mo de mémoire, 2 passes).
const OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
};

export function hacherMotDePasse(motDePasse: string): Promise<string> {
  return hash(motDePasse, OPTIONS);
}

export async function verifierMotDePasse(hashStocke: string, motDePasse: string): Promise<boolean> {
  try {
    return await verify(hashStocke, motDePasse);
  } catch {
    // Hash illisible (par exemple les comptes de démo) : connexion refusée.
    return false;
  }
}

// Quand le pseudo n'existe pas, on vérifie quand même un faux hash.
// Sinon la réponse serait plus rapide, et un attaquant pourrait deviner
// quels pseudos existent en mesurant le temps de réponse.
let hashFactice: Promise<string> | null = null;
export async function simulerVerification(motDePasse: string): Promise<void> {
  hashFactice ??= hacherMotDePasse('mot-de-passe-factice');
  await verifierMotDePasse(await hashFactice, motDePasse);
}
