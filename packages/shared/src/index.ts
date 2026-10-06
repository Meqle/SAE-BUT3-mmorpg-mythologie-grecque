export type RealmType = "olympus" | "elysium" | "tartarus";

export interface ServerInfo {
  id: string;
  name: string;
  realm: RealmType;
  description: string;
  host: string;
  port: number;
  playerCount: number;
  maxPlayers: number;
  status: "online" | "busy" | "full" | "offline";
  pingMs?: number;
}

export type GodAffinity = "ZEUS" | "POSEIDON" | "HADES" | "ATHENA" | "ARES" | "APOLLO";

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
    id: "ZEUS",
    name: "Zeus",
    title: "Roi de l'Olympe",
    realm: "olympus",
    color: "#facc15",
    passiveBonus: "+15% Vitesse",
    description: "Règne sur les cieux et les éclairs depuis le mont Olympe."
  },
  POSEIDON: {
    id: "POSEIDON",
    name: "Poséidon",
    title: "Souverain des Océans",
    realm: "olympus",
    color: "#38bdf8",
    passiveBonus: "+20% Résistance",
    description: "Dompte les flots et fait trembler la terre de son trident."
  },
  HADES: {
    id: "HADES",
    name: "Hadès",
    title: "Seigneur des Enfers",
    realm: "tartarus",
    color: "#a855f7",
    passiveBonus: "+10% Dégâts d'ombre",
    description: "Gouverne le royaume des morts et les profondeurs souterraines."
  },
  ATHENA: {
    id: "ATHENA",
    name: "Athéna",
    title: "Déesse de la Sagesse",
    realm: "elysium",
    color: "#2dd4bf",
    passiveBonus: "+15% Parade",
    description: "Protectrice des héros et stratège militaire sans égal."
  },
  ARES: {
    id: "ARES",
    name: "Arès",
    title: "Dieu de la Guerre",
    realm: "tartarus",
    color: "#ef4444",
    passiveBonus: "+25% Force brute",
    description: "Incarnation de la fureur guerrière et des champs de bataille."
  },
  APOLLO: {
    id: "APOLLO",
    name: "Apollon",
    title: "Dieu de la Lumière",
    realm: "elysium",
    color: "#fb923c",
    passiveBonus: "+15% Portée",
    description: "Guide les oracles et tire des flèches solaires à distance."
  }
};

export type ViewMode = "top-down" | "side-view";

export interface PlayerPosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: "left" | "right" | "up" | "down";
  isGrounded?: boolean;
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

export enum PacketType {
  JOIN_REQUEST = "JOIN_REQUEST",
  PLAYER_INPUT = "PLAYER_INPUT",
  SWITCH_VIEW_REQUEST = "SWITCH_VIEW_REQUEST",
  CHAT_SEND = "CHAT_SEND",
  JOIN_RESPONSE = "JOIN_RESPONSE",
  WORLD_TICK = "WORLD_TICK",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  VIEW_SWITCHED = "VIEW_SWITCHED",
  CHAT_BROADCAST = "CHAT_BROADCAST",
  ERROR = "ERROR"
}

export interface BasePacket {
  type: PacketType;
  timestamp: number;
}

export interface JoinRequestPacket extends BasePacket {
  type: PacketType.JOIN_REQUEST;
  roomId: string;
  username: string;
  god: GodAffinity;
}

export interface JoinResponsePacket extends BasePacket {
  type: PacketType.JOIN_RESPONSE;
  playerId: string;
  players: Record<string, PlayerState>;
}

export interface PlayerInputPacket extends BasePacket {
  type: PacketType.PLAYER_INPUT;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    jump?: boolean;
  };
}

export interface SwitchViewRequestPacket extends BasePacket {
  type: PacketType.SWITCH_VIEW_REQUEST;
  viewMode: ViewMode;
}

export interface WorldTickPacket extends BasePacket {
  type: PacketType.WORLD_TICK;
  tickNumber: number;
  players: Record<string, PlayerState>;
}

export interface ServerErrorPacket extends BasePacket {
  type: PacketType.ERROR;
  message: string;
}
