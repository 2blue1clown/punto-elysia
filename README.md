# Introduction

This is the server for a online multiplayer game called punto. This has been made for my portforlio to explore using
websockets, bun and dockers.

# Server endpoints

## newRoom

One of the players in the group will make a request to start a new room.
We need to:
- open the socket
- initialise new player and send to the client
- send back the session id (4 letters) for the other players to join with


## joinRoom(id:string)
The rest of the players make a request to join the specific room. Each room has a maximum of 3 players.
- open socket
- send the new connection room information (already connected players and their colors)
- broadcast to other players in the room that a new player has joined



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