// Jetons de connexion (JWT).
//
// Après une connexion réussie, le serveur donne au joueur un jeton signé.
// Le client le renvoie ensuite à chaque requête (en-tête Authorization),
// comme un badge d'accès. Le serveur vérifie la signature : un jeton
// modifié ou expiré est refusé, sans avoir besoin d'interroger la base.
import '../env.js';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

const DUREE_VALIDITE = '2h';

function secret(): string {
  const valeur = process.env.JWT_SECRET;
  if (valeur && valeur.length >= 32) return valeur;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET doit être défini (32 caractères minimum) en production.');
  }
  return secretDeDeveloppement;
}

// En développement, sans JWT_SECRET, on génère un secret temporaire.
// Les joueurs devront se reconnecter à chaque redémarrage du serveur.
const secretDeDeveloppement = randomBytes(48).toString('hex');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[auth] JWT_SECRET manquant ou trop court : la connexion des joueurs est désactivée.');
  } else {
    console.warn('[auth] JWT_SECRET absent : secret temporaire utilisé (développement uniquement).');
  }
}

export interface ContenuJeton {
  compteId: number;
  pseudo: string;
  role: string;
}

export function creerJeton(contenu: ContenuJeton): string {
  return jwt.sign({ pseudo: contenu.pseudo, role: contenu.role }, secret(), {
    subject: String(contenu.compteId),
    expiresIn: DUREE_VALIDITE,
    algorithm: 'HS256'
  });
}

// Renvoie le contenu du jeton, ou null s'il est invalide ou expiré.
export function lireJeton(jeton: string): ContenuJeton | null {
  try {
    const donnees = jwt.verify(jeton, secret(), { algorithms: ['HS256'] });
    if (typeof donnees === 'string' || !donnees.sub) return null;
    return {
      compteId: Number(donnees.sub),
      pseudo: String(donnees.pseudo),
      role: String(donnees.role)
    };
  } catch {
    return null;
  }
}
