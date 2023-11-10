import { Color, ServerSocket } from "./types"

export class Player {
  connection:ServerSocket
  color: Color
  id:string
  constructor(ws:ServerSocket,color:Color){
    this.connection = ws
    this.color = color
    this.id = crypto.randomUUID()
  }
}