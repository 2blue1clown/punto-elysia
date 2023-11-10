import { Color, JoinedEvent, PlayerJoinedEvent, PlayerLeftEvent, ServerSocket } from "./types"
import { Player } from "./player"

export default class Room {
  id:string
  players:Player[] = []
  availableColors: Color[] = [Color.BLUE,Color.RED,Color.GREEN,Color.YELLOW]

  constructor(){
    console.log('creating new room')
    this.id = Math.random().toString(36).substring(2,6)
  }

  addPlayer(ws:ServerSocket){
    if(this.players.length >= 4 && this.availableColors.length > 0){
      throw new Error('room already full')
    }
    const color = this.availableColors.pop()
    if(!color){
      throw new Error('no available colors')
    }

    const newPlayer = new Player(ws,color)
    this.players.push(newPlayer)

    const playerJoinedEvent:PlayerJoinedEvent = {
      eventType:"PLAYER_JOINED",
      data: {
        roomId:this.id,
        players: this.getGeneralPlayerInfo()
      }
    }

    const joinedEvent: JoinedEvent = {
      eventType:"JOINED",
      data:{
        playerId:newPlayer.id,
        roomId:this.id,
        players:this.players
      }
    }

    this.sendTo(joinedEvent,newPlayer.id)
    this.broadcast(playerJoinedEvent)

    console.log(`added ${newPlayer.id} to room ${this.id}`)
  }

  removePlayer(id:string){
    const player = this.players.find(p => p.id === id)
    if(!player){
      console.log('player ',id,' was not in room')
      return
    }
    this.availableColors.push(player.color)
    this.players = this.players.filter(p => p.id !== id)
    console.log('player ',player.id,' has been removed form room ',this.id)
    const event: PlayerLeftEvent = {
      eventType:"PLAYER_LEFT",
      data: {
        roomId:this.id,
        players: this.getGeneralPlayerInfo()
      }
    }
    this.broadcast(event)
  }

  
  getGeneralPlayerInfo(){
    return this.players.map(p => ({id:p.id, color:p.color}))
  }

  sendTo(message:unknown,id:string){
    console.log('sending to: ',id,JSON.stringify(message))
    this.players.find(p => p.id === id)?.connection.send(JSON.stringify(message))
  }

  broadcast(message: unknown){
    console.log('sending all: ',JSON.stringify(message))
    this.players.forEach(p => {
      p.connection.send(JSON.stringify(message))
    })
  }
}