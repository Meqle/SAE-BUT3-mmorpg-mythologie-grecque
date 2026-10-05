import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

// Point d'entrée WebSocket réservé au pôle Réseau
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    // À implémenter par le pôle Réseau
  });

  ws.on('close', () => {
    // Gestion de la déconnexion
  });
});

// Routes REST de base réservées au pôle Base de données
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
