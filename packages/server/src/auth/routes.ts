// API d'authentification : inscription, connexion, compte connecté, déconnexion.
//
//   POST /api/auth/register   { email, pseudo, motDePasse }  -> 201 { jeton, compte }
//   POST /api/auth/login      { identifiant, motDePasse }    -> 200 { jeton, compte }
//   GET  /api/auth/me         (en-tête Authorization: Bearer <jeton>) -> 200 { compte }
//   POST /api/auth/logout     (en-tête Authorization: Bearer <jeton>) -> 204
import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { creerCompte, trouverCompteParId, trouverCompteParIdentifiant } from '../db/requetes.js';
import { ServiceIndisponible } from '../redis/client.js';
import { cleEchecs, effacerEchecs, enregistrerEchec, secondesDeBlocage } from '../redis/antiForceBrute.js';
import { creerSession, sessionActive, supprimerSession } from '../redis/sessions.js';
import { creerJeton, DUREE_SESSION_SECONDES, lireJeton } from './jeton.js';
import { hacherMotDePasse, simulerVerification, verifierMotDePasse } from './motDePasse.js';

// Les règles reprennent celles de la base (schema.sql), pour donner un
// message clair au joueur avant même d'interroger PostgreSQL.
const schemaInscription = z.object({
  email: z.string().trim().toLowerCase().email('Adresse email invalide.').max(254),
  pseudo: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{3,20}$/, 'Le pseudo doit faire 3 à 20 caractères : lettres, chiffres, _ ou -.'),
  motDePasse: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères.')
    .max(128, 'Le mot de passe ne doit pas dépasser 128 caractères.')
});

const schemaConnexion = z.object({
  identifiant: z.string().trim().min(1, 'Pseudo ou email requis.').max(254),
  motDePasse: z.string().min(1, 'Mot de passe requis.').max(128)
});

type Compte = NonNullable<Awaited<ReturnType<typeof trouverCompteParId>>>;

// Ce qu'on renvoie au client : jamais le hash du mot de passe.
function comptePublic(compte: Compte) {
  return {
    id: compte.id,
    pseudo: compte.pseudo,
    email: compte.email,
    role: compte.role,
    dateCreation: compte.dateCreation
  };
}

// Crée le jeton ET la session Redis correspondante.
async function reponseAvecJeton(compte: Compte) {
  const { jeton, jti } = creerJeton({ compteId: compte.id, pseudo: compte.pseudo, role: compte.role });
  await creerSession(jti, compte.id, DUREE_SESSION_SECONDES);
  return { jeton, compte: comptePublic(compte) };
}

// Express 4 ne rattrape pas les erreurs des fonctions async : on les transmet nous-mêmes.
function asynchrone(fonction: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fonction(req, res).catch(next);
  };
}

// Récupère le code d'erreur PostgreSQL (Drizzle l'enveloppe dans "cause").
function erreurPostgres(erreur: unknown): { code?: string; constraint?: string } {
  const e = erreur as { code?: string; constraint?: string; cause?: unknown };
  return e?.code ? e : ((e?.cause as { code?: string; constraint?: string }) ?? {});
}

// Middleware : laisse passer uniquement les requêtes avec un jeton valide
// ET une session encore ouverte dans Redis (pas déconnectée, pas révoquée).
// Le compte connecté est ensuite disponible dans res.locals.compteId.
export function exigerConnexion(req: Request, res: Response, next: NextFunction): void {
  const entete = req.headers.authorization ?? '';
  const contenu = entete.startsWith('Bearer ') ? lireJeton(entete.slice(7)) : null;
  if (!contenu) {
    res.status(401).json({ erreur: 'Connexion requise ou jeton expiré.' });
    return;
  }
  sessionActive(contenu.jti, contenu.compteId)
    .then((active) => {
      if (!active) {
        res.status(401).json({ erreur: 'Session fermée : veuillez vous reconnecter.' });
        return;
      }
      res.locals.compteId = contenu.compteId;
      res.locals.jti = contenu.jti;
      next();
    })
    .catch(next);
}

export const routeurAuth = Router();

routeurAuth.post(
  '/register',
  asynchrone(async (req, res) => {
    const resultat = schemaInscription.safeParse(req.body);
    if (!resultat.success) {
      res.status(400).json({ erreur: resultat.error.issues[0]?.message ?? 'Données invalides.' });
      return;
    }
    const { email, pseudo, motDePasse } = resultat.data;

    try {
      const compte = await creerCompte({ email, pseudo, motDePasseHash: await hacherMotDePasse(motDePasse) });
      res.status(201).json(await reponseAvecJeton(compte));
    } catch (erreur) {
      const pg = erreurPostgres(erreur);
      if (pg.code === '23505') {
        const champ = pg.constraint === 'compte_email_unique' ? 'Cet email' : 'Ce pseudo';
        res.status(409).json({ erreur: `${champ} est déjà utilisé.` });
        return;
      }
      throw erreur;
    }
  })
);

routeurAuth.post(
  '/login',
  asynchrone(async (req, res) => {
    const resultat = schemaConnexion.safeParse(req.body);
    if (!resultat.success) {
      res.status(400).json({ erreur: resultat.error.issues[0]?.message ?? 'Données invalides.' });
      return;
    }
    const { identifiant, motDePasse } = resultat.data;

    const compte = await trouverCompteParIdentifiant(identifiant);

    // Anti force brute : trop d'échecs récents sur ce compte -> on refuse sans
    // même vérifier le mot de passe (429 = « trop de requêtes »).
    const cle = cleEchecs(compte?.id ?? null, identifiant);
    const attente = await secondesDeBlocage(cle);
    if (attente > 0) {
      res.set('Retry-After', String(attente));
      res.status(429).json({ erreur: `Trop de tentatives. Réessayez dans ${Math.ceil(attente / 60)} min.` });
      return;
    }

    if (!compte) {
      await simulerVerification(motDePasse);
    }
    // Même message que le pseudo soit inconnu ou le mot de passe faux :
    // on ne révèle pas quels comptes existent.
    if (!compte || !(await verifierMotDePasse(compte.motDePasseHash, motDePasse))) {
      await enregistrerEchec(cle);
      res.status(401).json({ erreur: 'Identifiant ou mot de passe incorrect.' });
      return;
    }
    await effacerEchecs(cle);
    if (compte.banni) {
      res.status(403).json({ erreur: 'Ce compte a été banni.' });
      return;
    }
    res.json(await reponseAvecJeton(compte));
  })
);

routeurAuth.get(
  '/me',
  exigerConnexion,
  asynchrone(async (_req, res) => {
    const compte = await trouverCompteParId(res.locals.compteId as number);
    if (!compte || compte.banni) {
      res.status(401).json({ erreur: 'Compte introuvable ou banni.' });
      return;
    }
    res.json({ compte: comptePublic(compte) });
  })
);

// Déconnexion : la session est supprimée de Redis, le jeton ne sert plus à rien.
routeurAuth.post(
  '/logout',
  exigerConnexion,
  asynchrone(async (_req, res) => {
    await supprimerSession(res.locals.jti as string, res.locals.compteId as number);
    res.status(204).end();
  })
);

// Gestion des erreurs inattendues de ces routes (base injoignable, bug...).
routeurAuth.use((erreur: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (erreur instanceof ServiceIndisponible) {
    console.error('[auth]', erreur.message, '-', (erreur.cause as Error | undefined)?.message ?? '');
    res.status(503).json({ erreur: 'Service temporairement indisponible, réessayez dans un instant.' });
    return;
  }
  const code = erreurPostgres(erreur).code;
  const baseInjoignable = code === 'ECONNREFUSED' || (erreur instanceof Error && /connect|timeout/i.test(erreur.message));
  console.error('[auth]', erreur instanceof Error ? erreur.message : erreur);
  res
    .status(baseInjoignable ? 503 : 500)
    .json({ erreur: baseInjoignable ? 'Base de données indisponible.' : 'Erreur interne du serveur.' });
});
