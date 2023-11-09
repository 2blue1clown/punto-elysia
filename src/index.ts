import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'

    

const app = new Elysia()
.use(cors())
.ws("/ws",{
  message(ws, message){
    console.log(message)
    ws.send({message:'Hello from elysia!'})
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

