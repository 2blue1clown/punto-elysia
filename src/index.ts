import { Context, Elysia, t } from "elysia";
import { cors } from '@elysiajs/cors'
import Host from "./host";
import { privateEncrypt } from "crypto";
import { ServerWebSocket } from "bun";
import { cookieToHeader } from "elysia/dist/handler";


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
.use(cors(
  {
    origin:process.env.CLIENT_URL,
    credentials:true
  }

))
.get("/create-room",({cookie:{puntoSession}})=> {
  const r = host.createRoom()
  puntoSession.sameSite='none'
  puntoSession.secure=true
  // puntoSession.domain=process.env.HOSTNAME
  puntoSession.value = {...puntoSession.value,roomId:r.id}
  return 'room created'
})
.ws("/join",{
  open(ws){
    //cookies need to be set on the client side
    const roomId = ws.data.cookie.roomId.value
    const channelId = ws.data.cookie.channelId.value
    console.log(channelId, 'is trying to join',roomId)
    const room = host.findRoom(roomId)
    if(room) {
      room.addPlayer(ws)
      return
    }
    ws.send({message:'could not join this room, disconnecting'})
    ws.close()

  },
  message(ws,message){},
  close(ws, code, message) {
    const channelId = ws.data.cookie.channelId.value
    console.log(channelId, ' is closing their connection')
    host.rooms.forEach(r => r.removePlayer(channelId))
  },
  beforeHandle(context){
    // console.log('cookie: roomId =',context.cookie.roomId.value)
  }
})
.listen({port:process.env.port,hostname:process.env.HOSTNAME});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
