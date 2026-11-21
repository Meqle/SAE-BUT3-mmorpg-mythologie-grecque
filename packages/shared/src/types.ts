// types communs client / serveur

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
