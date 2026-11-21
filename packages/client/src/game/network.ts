// connexion WebSocket au serveur de jeu
import {
  GodAffinity,
  JoinRequestPacket,
  PacketType,
  PlayerInputPacket,
  PlayerState,
  SwitchViewRequestPacket,
  ViewMode
} from '@greek-myth/shared';

interface ConnectionOptions {
  roomId: string;
  username: string;
  god: GodAffinity;
  getViewMode: () => ViewMode;
  onStatus: (status: string) => void;
}

export interface Connection {
  // derniers etats recus du serveur, indexes par id de joueur
  players: Map<string, PlayerState>;
  getPlayerId: () => string | null;
  sendInput: (keys: PlayerInputPacket['keys']) => void;
  sendViewMode: (mode: ViewMode) => void;
  close: () => void;
}

export function connect(options: ConnectionOptions): Connection {
  const players = new Map<string, PlayerState>();
  let playerId: string | null = null;
  let closedByUs = false;

  // meme hote que la page : Vite (dev) ou Nginx (Docker) relaie /ws vers le serveur
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);

  const send = (packet: object) => {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(packet));
  };

  const setPlayers = (list: Record<string, PlayerState>) => {
    players.clear();
    for (const [id, state] of Object.entries(list)) players.set(id, state);
  };

  const sendViewMode = (mode: ViewMode) => {
    if (!playerId) return;
    const packet: SwitchViewRequestPacket = { type: PacketType.SWITCH_VIEW_REQUEST, timestamp: Date.now(), viewMode: mode };
    send(packet);
  };

  socket.addEventListener('open', () => {
    const packet: JoinRequestPacket = {
      type: PacketType.JOIN_REQUEST,
      timestamp: Date.now(),
      roomId: options.roomId,
      username: options.username,
      god: options.god
    };
    send(packet);
  });

  socket.addEventListener('message', (event) => {
    let msg;
    try {
      msg = JSON.parse(String(event.data));
    } catch {
      options.onStatus('Message réseau invalide');
      return;
    }
    if (msg.type === PacketType.ERROR) {
      options.onStatus(msg.message || 'Erreur de connexion');
    } else if (msg.type === PacketType.JOIN_RESPONSE && msg.playerId && msg.players) {
      playerId = msg.playerId;
      setPlayers(msg.players);
      options.onStatus('Connecté');
      // si on a change de vue avant d'etre connecte, on previent le serveur
      if (options.getViewMode() !== 'top-down') sendViewMode(options.getViewMode());
    } else if (msg.type === PacketType.WORLD_TICK && msg.players) {
      setPlayers(msg.players);
    }
  });

  socket.addEventListener('close', () => {
    if (!closedByUs) options.onStatus('Déconnecté');
  });
  socket.addEventListener('error', () => options.onStatus('Serveur inaccessible'));

  return {
    players,
    getPlayerId: () => playerId,
    sendInput: (keys) => {
      const packet: PlayerInputPacket = { type: PacketType.PLAYER_INPUT, timestamp: Date.now(), keys };
      send(packet);
    },
    sendViewMode,
    close: () => {
      closedByUs = true;
      socket.close();
    }
  };
}
