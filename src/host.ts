import Room from "./room"
import { ServerSocket } from "./types"


export default class Host { 
  rooms:Room[] = []
  connections:ServerSocket[] = []
  constructor(){}
  
  createRoom(){
    const room = new Room()
    this.rooms.push(room)
    return room
  }

  findRoom(id:string){
    return this.rooms.find(r => r.id === id )
  }

}