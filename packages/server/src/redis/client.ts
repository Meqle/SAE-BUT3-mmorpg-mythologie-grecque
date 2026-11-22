// Connexion du serveur à Redis.
//
// Redis garde en mémoire les données qui vivent peu de temps : sessions,
// compteurs d'essais de connexion, classement en direct. PostgreSQL reste
// la référence pour tout ce qui doit durer.
//
// - Dans Docker : l'adresse arrive par la variable REDIS_URL (docker-compose.yml).
// - En local : on lit le .env à la racine et on passe par le port publié (REDIS_PORT).
import '../env.js';
import { Redis } from 'ioredis';

function adresseRedis(): string {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  const motDePasse = encodeURIComponent(process.env.REDIS_PASSWORD ?? 'mythologia');
  const port = process.env.REDIS_PORT ?? '6379';
  return `redis://:${motDePasse}@localhost:${port}`;
}

export const redis = new Redis(adresseRedis(), {
  // Si Redis est arrêté, on échoue tout de suite au lieu de faire attendre le joueur.
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  // Reconnexion automatique : on réessaie toutes les 0,5 s, puis au plus toutes les 5 s.
  retryStrategy: (essai) => Math.min(essai * 500, 5000)
});

// ioredis signale une erreur à chaque tentative de reconnexion :
// on n'affiche que les changements d'état, pour ne pas inonder les logs.
let dernierEtat = '';
function signaler(etat: string, detail = ''): void {
  if (etat === dernierEtat) return;
  dernierEtat = etat;
  const message = `[redis] ${etat}${detail ? ' : ' + detail : ''}`;
  if (etat === 'connecté') console.log(message);
  else console.warn(message);
}
redis.on('ready', () => signaler('connecté'));
redis.on('error', (erreur) => signaler('injoignable', erreur.message));

// Erreur levée quand Redis ne répond pas : les routes la transforment en 503.
export class ServiceIndisponible extends Error {
  constructor(public readonly service: string, cause?: unknown) {
    super(`${service} indisponible`, { cause });
    this.name = 'ServiceIndisponible';
  }
}

// Exécute une commande Redis ; en cas d'échec, lève ServiceIndisponible.
export async function avecRedis<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (erreur) {
    throw new ServiceIndisponible('Redis', erreur);
  }
}

// Attend que la connexion soit prête (utile pour les scripts lancés à la main).
export function attendreRedis(delaiMs = 5000): Promise<boolean> {
  if (redis.status === 'ready') return Promise.resolve(true);
  return new Promise((resolve) => {
    const minuterie = setTimeout(() => {
      redis.off('ready', pret);
      resolve(false);
    }, delaiMs);
    function pret() {
      clearTimeout(minuterie);
      resolve(true);
    }
    redis.once('ready', pret);
  });
}

export async function redisDisponible(): Promise<boolean> {
  try {
    return (await redis.ping()) === 'PONG';
  } catch {
    return false;
  }
}

export async function fermerRedis(): Promise<void> {
  redis.disconnect();
}
