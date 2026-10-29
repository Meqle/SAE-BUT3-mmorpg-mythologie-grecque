// Charge le fichier .env situé à la racine du dépôt (développement en local).
// Dans Docker, il n'y a pas de .env : les variables viennent de docker-compose.yml.
// Ce fichier est importé en premier par les modules qui lisent des variables d'environnement.
import path from 'path';
import { config } from 'dotenv';

// packages/server/src (ou dist) -> 3 niveaux au-dessus = racine du dépôt.
config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });
