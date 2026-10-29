// Connexion du serveur à PostgreSQL.
//
// - Dans Docker : l'adresse de la base arrive par la variable DATABASE_URL
//   (définie dans docker-compose.yml).
// - En local (npm run dev) : on lit le fichier .env à la racine du dépôt et on
//   se connecte à la base Docker par le port publié sur la machine (POSTGRES_PORT).
import path from 'path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from './schema.js';

// Racine du dépôt : packages/server/src/db (ou dist/db) -> 4 niveaux au-dessus.
config({ path: path.resolve(__dirname, '../../../../.env'), quiet: true });

function adresseBase(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const user = process.env.POSTGRES_USER ?? 'mythologia';
  const password = encodeURIComponent(process.env.POSTGRES_PASSWORD ?? 'mythologia');
  const database = process.env.POSTGRES_DB ?? 'mythologia';
  const port = process.env.POSTGRES_PORT ?? '5432';
  return `postgres://${user}:${password}@localhost:${port}/${database}`;
}

// Un "pool" garde quelques connexions ouvertes et les réutilise :
// c'est bien plus rapide que d'ouvrir une connexion à chaque requête.
export const pool = new Pool({
  connectionString: adresseBase(),
  max: 10,
  connectionTimeoutMillis: 5000
});

pool.on('error', (error) => {
  console.error('Erreur PostgreSQL inattendue :', error.message);
});

// Objet à utiliser partout pour faire des requêtes typées.
export const db = drizzle(pool, { schema });

// Vérifie que la base répond (utile pour /api/health et au démarrage).
export async function baseDisponible(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

export async function fermerBase(): Promise<void> {
  await pool.end();
}
