// Écriture dans le journal des événements (table journal_evenement).
//
// Le journal sert à comprendre ce qui s'est passé : qui s'est connecté,
// d'où, combien de connexions ont été refusées, quelles sauvegardes ont été
// rejetées (bug ou triche)... C'est un historique DURABLE (PostgreSQL),
// alors que le compteur anti force brute de Redis expire au bout de 5 min.
//
// Règle importante : écrire dans le journal ne doit JAMAIS faire échouer
// ni ralentir l'action du joueur. On lance l'écriture sans l'attendre ; si
// elle échoue (base surchargée...), on l'affiche dans la console et c'est tout.
import { isIP } from 'node:net';
import type { Request } from 'express';
import { db } from '../db/client.js';
import { journalEvenement, type TypeEvenement } from '../db/schema.js';

export interface Evenement {
  type: TypeEvenement;
  compteId?: number | null;
  adresseIp?: string | null;
  details?: Record<string, unknown>;
}

// Écritures en cours : permet aux scripts (et aux tests) d'attendre qu'elles soient finies.
const enCours = new Set<Promise<void>>();

export function journaliser(evenement: Evenement): void {
  const ecriture = db
    .insert(journalEvenement)
    .values({
      type: evenement.type,
      compteId: evenement.compteId ?? null,
      adresseIp: adresseValide(evenement.adresseIp),
      details: evenement.details ?? {}
    })
    .then(() => undefined)
    .catch((erreur: unknown) => {
      console.error('[journal] écriture impossible :', erreur instanceof Error ? erreur.message : erreur);
    })
    .finally(() => enCours.delete(ecriture));
  enCours.add(ecriture);
}

export async function attendreJournal(): Promise<void> {
  await Promise.all([...enCours]);
}

// Adresse IP du joueur.
// Attention : derrière Nginx, req.ip est l'adresse de Nginx, pas celle du
// joueur, tant que le serveur n'a pas app.set('trust proxy', 1) ET que Nginx
// n'envoie pas l'en-tête X-Forwarded-For (à régler avec le pôle réseau).
export function adresseClient(req: Request): string | null {
  return adresseValide(req.ip);
}

// La colonne est de type INET : on n'y met qu'une vraie adresse IP.
// « ::ffff:192.0.2.10 » (IPv4 vue par un serveur IPv6) devient « 192.0.2.10 ».
function adresseValide(adresse: string | null | undefined): string | null {
  if (!adresse) return null;
  const nettoyee = adresse.startsWith('::ffff:') ? adresse.slice(7) : adresse;
  return isIP(nettoyee) ? nettoyee : null;
}
