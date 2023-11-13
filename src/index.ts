import { Context, Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import Host from "./host";

const host = new Host();

const app = new Elysia({
  websocket: {
    idleTimeout: 30,
  },
})
  .use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  )
  .get("/create-room", ({ cookie: { puntoSession } }) => {
    const r = host.createRoom();
    console.log("created new room ", r.id);
    return { room: r.id };
  })
  .get("/join/:room", ({ params: { room }, cookie: { puntoSession } }) => {
    console.log("trying to join", room);
    puntoSession.sameSite = "none";
    puntoSession.secure = true;
    puntoSession.value = { id: crypto.randomUUID(), room: room };
    const r = host.findRoom(room);
    if (r) {
      return { message: "room found" };
    }
    return "room not found";
  })
  .ws("/join", {
    open(ws) {
      const room = ws.data.cookie.puntoSession.value.room;
      const sessionId = ws.data.cookie.puntoSession.value.id;
      console.log(sessionId, "is trying to join", room);
      const r = host.findRoom(room);
      if (!r) {
        ws.close();
        return;
      }

      try {
        r.addPlayer(ws);
        return;
      } catch (e) {
        if (e instanceof Error) {
          ws.send({ message: `could not join this room becasue ${e.message}` });
        } else {
          ws.send({ message: `could not join this room becasue ${e}` });
        }
        ws.close();
        return;
      }
    },
    message(ws, message) {},
    close(ws, code, message) {
      const sessionId = ws.data.cookie.puntoSession.value.id;
      console.log(sessionId, " is closing their connection");
      host.rooms.forEach((r) => r.removePlayer(sessionId));
    },
  })
  .listen({ port: process.env.port, hostname: process.env.HOSTNAME });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
