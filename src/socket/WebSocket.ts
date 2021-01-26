import Client from "./Client"
import '@types/ws'
import WebSocket from 'ws'

export class DiscordSocket {
  private client: Client
  private id: number

  public ready: boolean
  public ws: WebSocket

  constructor (client: Client, id: number) {
    this.client = client
    this.id = id

    this.ready = false
    this.ws = null
  }

  async spawn () {
    this.ws = new WebSocket('')
  }
}