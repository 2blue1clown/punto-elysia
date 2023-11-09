import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import { ElysiaWS } from "elysia/dist/ws";
import { Serve, ServerWebSocket } from "bun";

type ServerSocket = ElysiaWS<ServerWebSocket<{}>>
enum Color {
  RED,
  BLUE,
  GREEN,
  YELLOW
}

class Host { 
  rooms:Room[] = []
  constructor(){}
  
  createRoom(ws:ServerSocket){
    const room = new Room(ws)
    this.rooms.push(room)
  }

  findRoom(id:string){
    return this.rooms.find(r => r.id === id )
  }

}

class Room {
  id:string
  players:Player[] = []

  constructor(ws:ServerSocket){
    console.log('creating new room')
    this.id = Math.random().toString(36).substring(2,6)
    this.addPlayer(ws)
  }

  addPlayer(ws:ServerSocket){
    if(this.players.length >= 4){
      throw new Error('room already full')
    }
    const newPlayer = new Player(ws,this.players.length)
    this.players.push(newPlayer)
    newPlayer.connection.send({
      roomId: this.id,
      players:this.players.map(p => ({id:p.id, color:p.color}))})
    console.log(`added ${newPlayer.id} to room ${this.id}`)
  }

  broadcast(message: Object){
    this.players.forEach(p => {
      p.connection.send(message)
    })
  }
}

class Player {
  connection:ServerSocket
  color: Color
  id:number
  constructor(ws:ServerSocket,color:Color){
    this.connection = ws
    this.color = color
    this.id = this.connection.id // not sure if this is a bad idea
  }
}

const host = new Host()

interface RoomJoin {
  roomId:string
}

const app = new Elysia({
    websocket: {
        idleTimeout: 30
    }
})
.use(cors())
.ws("/ws",{
  open(ws){
    console.log('new connection: ',ws.id)
    host.createRoom(ws)
  },
  message(ws, message){}
})
.ws("/join",{
  message(ws,message){
    const roomId = (message as RoomJoin).roomId
    console.log(ws.id, 'is trying to join',roomId)
    const room = host.findRoom(roomId)
    if(room) {
      room.addPlayer(ws)
      return
    }
    ws.send({message:'could not join this room, disconnecting'})
    ws.close()
    
  }

})
.get("/", (context) => {
  // console.log(context)
  return {message:"Hello Elysia"}
})
// .listen({port:3000,hostname:'0.0.0.0'});
.listen({port:process.env.port,hostname:process.env.HOSTNAME});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

