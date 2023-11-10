# Introduction

This is the server for a online multiplayer game called punto. This has been made for my portforlio to explore using
websockets, bun and dockers.

# Server endpoints

Room logic

- Server receives a request to make a new room (get)
- Server makes new room and adds it to the rooms


## newRoom

One of the players in the group will make a request to start a new room.
We need to:
- open the socket
- initialise new player and send to the client
- send back the session id (4 letters) for the other players to join with


## joinRoom(id:string)
The rest of the players make a request to join a specific room. Each room has a maximum of 4 players.
- open socket with client
- create a unique id for the player (this should maybe get stored in a session somehow??)
- send the new connection room information (already connected players and their colors)
- broadcast to other players in the room that a new player has joined

# Events

## PlayerJoin
- this event will be emitted to all players within a room when a new player joins

## NewGame

# Event Responses

- At this stage I think its a good idea to have all of the messages that come from the server follow a certain 
format...
- interface PuntoEvent <T> {
    type: string
    data: T
}

# Fly.io

The project is deployed using the free tier of fly.io because vercel does not allow long running servers. 


# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.