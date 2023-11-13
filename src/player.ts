import { Color, ServerSocket } from "./types";

export class Player {
  send: Function;
  color: Color;
  id: string;
  constructor(send: Function, id: string, color: Color) {
    this.send = send;
    this.color = color;
    this.id = id;
  }
}
