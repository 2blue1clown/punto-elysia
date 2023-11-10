import Room from "./room"


export default class Host { 
  rooms:Room[] = []
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