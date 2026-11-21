// Jetons de connexion (JWT).
//
// Après une connexion réussie, le serveur donne au joueur un jeton signé.
// Le client le renvoie ensuite à chaque requête (en-tête Authorization),
// comme un badge d'accès. Le serveur vérifie la signature : un jeton
// modifié ou expiré est refusé.
//
// Chaque jeton porte aussi un identifiant unique (jti), enregistré comme
// session dans Redis : supprimer la session suffit à révoquer le jeton
// avant son expiration (déconnexion, bannissement). Voir redis/sessions.ts.
import '../env.js';
import { randomBytes, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

// Durée de validité d'un jeton, et donc de la session Redis associée.
export const DUREE_SESSION_SECONDES = 2 * 60 * 60; // 2 heures

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

export interface JetonLu extends ContenuJeton {
  jti: string;
}

// Crée un jeton et renvoie aussi son identifiant unique (jti) pour la session Redis.
export function creerJeton(contenu: ContenuJeton): { jeton: string; jti: string } {
  const jti = randomUUID();
  const jeton = jwt.sign({ pseudo: contenu.pseudo, role: contenu.role }, secret(), {
    subject: String(contenu.compteId),
    jwtid: jti,
    expiresIn: DUREE_SESSION_SECONDES,
    algorithm: 'HS256'
  });
  return { jeton, jti };
}

// Renvoie le contenu du jeton, ou null s'il est invalide ou expiré.
export function lireJeton(jeton: string): JetonLu | null {
  try {
    const donnees = jwt.verify(jeton, secret(), { algorithms: ['HS256'] });
    if (typeof donnees === 'string' || !donnees.sub || !donnees.jti) return null;
    return {
      compteId: Number(donnees.sub),
      pseudo: String(donnees.pseudo),
      role: String(donnees.role),
      jti: donnees.jti
    };
  } catch {
    return null;
  }
}
