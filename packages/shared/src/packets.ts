// paquets echanges sur le WebSocket
import type { GodAffinity, PlayerState, ViewMode } from './types.js';

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
