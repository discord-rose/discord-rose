import { GatewayGuildCreateDispatchData, GatewayReadyDispatchData } from "discord-api-types"
import Client from "../clustering/worker/Worker"
import { DiscordSocket } from './WebSocket'

export class Shard {
  public ping: number

  private ws = new DiscordSocket(this)

  constructor (public id: number, public worker: Client) {
    let unavailableGuilds = []
    this.ws.on('READY', (data: GatewayReadyDispatchData) => {
      this.worker.comms.tell('SHARD_READY', { id })

      // unavailableGuilds = data.guilds
    })

    this.ws.on('GUILD_CREATE', (data: GatewayGuildCreateDispatchData) => {
      if (unavailableGuilds.length < 1) return this.worker.emit('GUILD_CREATE', data)

      // if (this.client.options.cache.guilds) this.client
    })
  }

  async start (): Promise<void> {
    return new Promise(resolve => {
      this.ws.spawn(resolve)
    })
  }

  register () {
    return this.worker.comms.registerShard(this.id)
  }

  restart (kill: boolean) {
    if (kill) this.ws.kill()
    else {
      this.ws.resuming = true
    }
    this.ws.ws.close()
  }
}
