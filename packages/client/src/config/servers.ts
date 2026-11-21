// liste des serveurs affichee dans le lobby
// TODO : a remplacer par GET /api/servers quand Reseau / BDD l'exposent
import type { ServerInfo } from '@greek-myth/shared';

export const DEFAULT_SERVERS: ServerInfo[] = [
  {
    id: 'olympus-1',
    name: 'Mont Olympe #1',
    realm: 'olympus',
    description: 'Le sommet céleste des Dieux. Royaume de Zeus & Poséidon.',
    host: 'localhost',
    port: 3001,
    playerCount: 142,
    maxPlayers: 200,
    status: 'online',
    pingMs: 14
  },
  {
    id: 'elysium-1',
    name: 'Champs Élysées #1',
    realm: 'elysium',
    description: 'Terre sacrée des héros légendaires, sanctuaire d\'Athéna et Apollon.',
    host: 'localhost',
    port: 3001,
    playerCount: 88,
    maxPlayers: 200,
    status: 'online',
    pingMs: 18
  },
  {
    id: 'tartarus-1',
    name: 'Gouffre du Tartare #1',
    realm: 'tartarus',
    description: 'Abîme ténébreux gardé par Hadès. Monstres et titans scellés.',
    host: 'localhost',
    port: 3001,
    playerCount: 195,
    maxPlayers: 200,
    status: 'busy',
    pingMs: 25
  }
];
