import { Context, Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import Host from "./host";
import { StartGameEvent } from "./types";

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
  .get("/create-room", (context) => {
    const r = host.createRoom();
    console.log("created new room ", r.id);
    return { room: r.id };
  })
  .get("/join/:room", ({ params: { room }, cookie: { puntoSession } }) => {
    console.log("trying to join", room);
    const r = host.findRoom(room);
    if (r) {
      puntoSession.sameSite = "none";
      puntoSession.secure = true;
      puntoSession.value = { id: crypto.randomUUID(), room: room };
      return { message: "room found" };
    }
    console.log("room not found");
    return { messsage: "room not found" };
  })
  .ws("/join", {
    body: t.Object({
      action: t.String(),
      data: t.Unknown(),
    }),
    response: t.Object({
      eventType: t.String(),
      data: t.Any(),
    }),
    open(ws) {
      const room = ws.data.cookie.puntoSession.value.room;
      const sessionId = ws.data.cookie.puntoSession.value.id;
      console.log(sessionId, "is trying to join", room);
      const r = host.findRoom(room);
      if (!r) {
        console.log("room does not exist, closing");
        ws.close();
        return;
      }
      try {
        r.addPlayer(sessionId, ws.send);
        return;
      } catch (e) {
        let msg = "";
        if (e instanceof Error) {
          msg = `could not join this room becasue ${e.message}, closing`;
        } else {
          msg = `could not join this room becasue ${e}, closing`;
        }
        console.log(msg);
        ws.close();
        return;
      }
    },
    message(ws, message) {
      console.log(
        ws.data.cookie.puntoSession.value.id,
        " has sent ",
        message.action
      );
      switch (message.action) {
        case "START_GAME":
          const e: StartGameEvent = { eventType: "START_GAME", data: null };
          host.findRoom(ws.data.cookie.puntoSession.value.room)?.broadcast(e);
      }
    },
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
