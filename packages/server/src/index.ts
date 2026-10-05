import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { PacketType, ServerInfo } from '@greek-myth/shared';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

// Serveur WebSocket pour le temps réel (Réseau BUT3)
const wss = new WebSocketServer({ server: httpServer });

// Liste simulée des serveurs/royaumes grecs disponibles
const REALMS: ServerInfo[] = [
  {
    id: 'olympus-prime',
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
    id: 'elysium-heroes',
    name: 'Champs Élysées #1',
    realm: 'elysium',
    description: 'Terre sacrée des héros légendaires, protégée par Athéna et Apollon.',
    host: 'localhost',
    port: 3001,
    playerCount: 88,
    maxPlayers: 200,
    status: 'online',
    pingMs: 18
  },
  {
    id: 'tartarus-underworld',
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

// Endpoint REST pour récupérer la liste des serveurs du Lobby
app.get('/api/servers', (_req, res) => {
  res.json({
    success: true,
    servers: REALMS
  });
});

// Gestion des connexions WebSocket de jeu
wss.on('connection', (ws: WebSocket) => {
  console.log('⚡ [Réseau] Nouveau héros connecté au royaume');

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📥 Paquet reçu :', data.type);

      // Traitement des paquets...
    } catch (err) {
      console.error('Erreur lecture paquet:', err);
    }
  });

  ws.on('close', () => {
    console.log('⚡ [Réseau] Héros déconnecté');
  });
});

httpServer.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🏛️ Serveur Mythologia MMO démarré sur le port ${PORT}`);
  console.log(`📡 WebSocket prêt pour les connexions de jeu`);
  console.log(`===============================================`);
});
