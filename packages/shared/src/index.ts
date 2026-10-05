// ==========================================
// ROYAUMES & SERVEURS MYTHOLOGIQUES
// ==========================================

export type RealmType = 'olympus' | 'elysium' | 'tartarus';

export interface ServerInfo {
  id: string;
  name: string;
  realm: RealmType;
  description: string;
  host: string;
  port: number;
  playerCount: number;
  maxPlayers: number;
  status: 'online' | 'busy' | 'full' | 'offline';
  pingMs?: number;
}

// ==========================================
// ALLÉGEANCE DIVINE & PERSONNAGES
// ==========================================

export type GodAffinity = 'ZEUS' | 'POSEIDON' | 'HADES' | 'ATHENA' | 'ARES' | 'APOLLO';

export interface GodLore {
  id: GodAffinity;
  name: string;
  title: string;
  realm: RealmType;
  color: string;
  passiveBonus: string;
  description: string;
}

export const GODS_LORE: Record<GodAffinity, GodLore> = {
  ZEUS: {
    id: 'ZEUS',
    name: 'Zeus',
    title: 'Roi de l\'Olympe & Maître de la Foudre',
    realm: 'olympus',
    color: '#facc15',
    passiveBonus: '+15% Vitesse de déplacement',
    description: 'Règne sur les cieux et les éclairs depuis le sommet du mont Olympe.'
  },
  POSEIDON: {
    id: 'POSEIDON',
    name: 'Poséidon',
    title: 'Souverain des Océans & des Tempêtes',
    realm: 'olympus',
    color: '#38bdf8',
    passiveBonus: '+20% Résistance et endurance',
    description: 'Dompte les flots et fait trembler la terre de son trident.'
  },
  HADES: {
    id: 'HADES',
    name: 'Hadès',
    title: 'Seigneur des Enfers & des Ombres',
    realm: 'tartarus',
    color: '#a855f7',
    passiveBonus: '+10% Dégâts d\'ombre & régénération',
    description: 'Gouverne le royaume des morts et les richesses souterraines cachées.'
  },
  ATHENA: {
    id: 'ATHENA',
    name: 'Athéna',
    title: 'Déesse de la Sagesse & Stratégie',
    realm: 'elysium',
    color: '#2dd4bf',
    passiveBonus: '+15% Intelligence & Parade tactique',
    description: 'Protectrice des héros, stratège sans égal et gardienne du savoir.'
  },
  ARES: {
    id: 'ARES',
    name: 'Arès',
    title: 'Dieu du Conflit & de la Guerre Brutale',
    realm: 'tartarus',
    color: '#ef4444',
    passiveBonus: '+25% Force brute',
    description: 'Incarnation de la fureur guerrière et des champs de bataille sanglants.'
  },
  APOLLO: {
    id: 'APOLLO',
    name: 'Apollon',
    title: 'Dieu de la Lumière, Musique & Prophétie',
    realm: 'elysium',
    color: '#fb923c',
    passiveBonus: '+15% Portée et précision',
    description: 'Illumine le monde de ses flèches d\'or et guide les oracles.'
  }
};

// ==========================================
// VUES & ÉTATS DE JEU 2D
// ==========================================

export type ViewMode = 'top-down' | 'side-view';

export interface PlayerPosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: 'left' | 'right' | 'up' | 'down';
  isGrounded?: boolean; // Pour la vue de profil (side-view / plateforme)
}

export interface PlayerState {
  id: string;
  username: string;
  god: GodAffinity;
  level: number;
  hp: number;
  maxHp: number;
  position: PlayerPosition;
  viewMode: ViewMode;
  currentRoomId: string;
}

// ==========================================
// PROTOCOLE DE COMMUNICATION RÉSEAU
// ==========================================

export enum PacketType {
  // Client -> Server
  JOIN_REQUEST = 'JOIN_REQUEST',
  PLAYER_INPUT = 'PLAYER_INPUT',
  SWITCH_VIEW_REQUEST = 'SWITCH_VIEW_REQUEST',
  CHAT_SEND = 'CHAT_SEND',

  // Server -> Client
  JOIN_RESPONSE = 'JOIN_RESPONSE',
  WORLD_TICK = 'WORLD_TICK',
  PLAYER_JOINED = 'PLAYER_JOINED',
  PLAYER_LEFT = 'PLAYER_LEFT',
  VIEW_SWITCHED = 'VIEW_SWITCHED',
  CHAT_BROADCAST = 'CHAT_BROADCAST',
  ERROR = 'ERROR'
}

export interface BasePacket {
  type: PacketType;
  timestamp: number;
}

export interface PlayerInputPacket extends BasePacket {
  type: PacketType.PLAYER_INPUT;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    jump?: boolean; // Utilisé en vue profil
  };
}

export interface WorldTickPacket extends BasePacket {
  type: PacketType.WORLD_TICK;
  tickNumber: number;
  players: Record<string, PlayerState>;
}
