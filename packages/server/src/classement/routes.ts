// API du classement en direct (lecture seule : les points sont ajoutés
// par le serveur de jeu, jamais directement par un joueur).
//
//   GET /api/classement?saison=1&limite=10  -> 200 { saison, classement: [{ rang, personnage, score }] }
import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { ServiceIndisponible } from '../redis/client.js';
import { meilleursJoueurs } from '../redis/classement.js';

const schemaRequete = z.object({
  saison: z.coerce.number().int().min(1).max(999).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10)
});

export const routeurClassement = Router();

routeurClassement.get('/', (req: Request, res: Response, next: NextFunction) => {
  const resultat = schemaRequete.safeParse(req.query);
  if (!resultat.success) {
    res.status(400).json({ erreur: 'Paramètres invalides : saison (1 à 999) et limite (1 à 100).' });
    return;
  }
  const { saison, limite } = resultat.data;
  meilleursJoueurs(saison, limite)
    .then((classement) => res.json({ saison, classement }))
    .catch(next);
});

routeurClassement.use((erreur: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[classement]', erreur instanceof Error ? erreur.message : erreur);
  const indisponible = erreur instanceof ServiceIndisponible;
  res
    .status(indisponible ? 503 : 500)
    .json({ erreur: indisponible ? 'Classement temporairement indisponible.' : 'Erreur interne du serveur.' });
});
