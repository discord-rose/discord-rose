import { GatewayGuildCreateDispatchData, GatewayReadyDispatchData } from "discord-api-types"
import Client from "./Client"
import { DiscordSocket } from './WebSocket'

export class Shard {
  public ping: number

  private ws = new DiscordSocket(this)

  constructor (public id: number, public client: Client) {
    let unavailableGuilds = []
    this.ws.on('READY', (data: GatewayReadyDispatchData) => {
      this.client.comms.tell('SHARD_READY', { id })

      unavailableGuilds = data.guilds
    })

    this.ws.on('GUILD_CREATE', (data: GatewayGuildCreateDispatchData) => {
      if (unavailableGuilds.length < 1) return this.client.emit('GUILD_CREATE', data)

      if (this.client.options.cache.guilds) this.client
    })
  }

  async start (): Promise<void> {
    return new Promise(resolve => {
      this.ws.spawn(resolve)
    })
  }

  restart () {}
}
