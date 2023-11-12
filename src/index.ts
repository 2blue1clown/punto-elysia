import { Context, Elysia, t } from "elysia";
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
.use(cors(
  {
    origin:process.env.CLIENT_URL,
    credentials:true
  }

))
.get("/session",({cookie:{puntoSession}})=> {
    puntoSession.sameSite='none'
    puntoSession.secure=true
    puntoSession.value = {id:crypto.randomUUID(),room:''}
    return {message:'session started'}

})
.get("/create-room",({cookie:{puntoSession}})=> {
  const r = host.createRoom()
  console.log('created new room ',r.id)
  return {room: r.id}
})
.get("/join/:room",({params:{room},cookie:{puntoSession}})=> {
    console.log( 'trying to join',room)
    puntoSession.sameSite='none'
    puntoSession.secure=true
    puntoSession.value = {id:crypto.randomUUID(),room:room}
    const r= host.findRoom(room)
    if(r){
      return {message:'room found'}
    }
    return 'room not found'
})
.ws("/join",{
  open(ws){
    const room = ws.data.cookie.puntoSession.value.room
    const channelId = ws.data.cookie.puntoSession.value.id
    console.log(channelId, 'is trying to join',room)
    const r = host.findRoom(room)
    if(r) {
      try{
      r.addPlayer(ws)
      return
      } catch(e:any){
        ws.send({message:`could not join this room becasue ${e.message}`})
        return
      }
    }
    ws.close()

  },
  message(ws,message){},
  close(ws, code, message) {
    const channelId = ws.data.cookie.puntoSession.value.id
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
