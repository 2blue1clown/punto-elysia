import { ServerWebSocket } from "bun";
import { ElysiaWS } from "elysia/dist/ws";

export type ServerSocket = ElysiaWS<ServerWebSocket<{}>>;
export enum Color {
  RED = "RED",
  BLUE = "BLUE",
  GREEN = "GREEN",
  YELLOW = "YELLOW",
}

export interface PuntoEvent<T> {
  eventType: string;
  data: T;
}
export interface GeneralPlayerInfo {
  color: Color;
  id: string;
}
export interface PlayerJoinInfo {
  roomId: string;
  players: GeneralPlayerInfo[];
}

export interface JoinedInfo {
  players: GeneralPlayerInfo[];
  playerId: string;
  roomId: string;
}

export interface JoinedEvent extends PuntoEvent<JoinedInfo> {
  eventType: "JOINED";
}

export interface PlayerJoinedEvent extends PuntoEvent<PlayerJoinInfo> {
  eventType: "PLAYER_JOINED";
}
export interface PlayerLeftEvent extends PuntoEvent<PlayerJoinInfo> {
  eventType: "PLAYER_LEFT";
}
export interface StartGameEvent extends PuntoEvent<null> {
  eventType: "START_GAME";
}
