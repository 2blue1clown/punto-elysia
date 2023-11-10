import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import Host from "./host";


const host = new Host()

interface RoomJoin {
  roomId:string
}

interface WebSocketData {
  createdAt: number;
  channelId: string;
}

const app = new Elysia({
    websocket: {
        idleTimeout: 30
    }
})
.use(cors())
.get("/create-room",(context)=> {
  const r = host.createRoom()
  return {roomId:r.id}
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
  },
  close(ws, code, message) {
    //TODO: need to complete the close logic
    // console.log('closing connection with ', ws.id)
    // host.rooms.forEach(r => r.removePlayer(ws))

  },

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

