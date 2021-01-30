import Collection from "@discordjs/collection"
import { GatewayGuildCreateDispatchData, GatewayReadyDispatchData, Snowflake } from "discord-api-types"
import Client from "../clustering/worker/Worker"
import { DiscordSocket } from './WebSocket'

export class Shard {
  public ping: number

  private ws = new DiscordSocket(this)
  private unavailableGuilds: Collection<Snowflake, {}>

  constructor (public id: number, public worker: Client) {
    this.ws.on('READY', (data: GatewayReadyDispatchData) => {
      this.worker.comms.tell('SHARD_READY', { id })

      this.worker.user = data.user

      this.unavailableGuilds = new Collection()

      if (data.guilds.length < 1 || !this.worker.options.cache.guilds) return this._ready()

      data.guilds.forEach(guild => this.unavailableGuilds.set(guild.id, guild))
    })

    let checkTimeout: NodeJS.Timeout

    this.ws.on('GUILD_CREATE', (data: GatewayGuildCreateDispatchData) => {
      if (!this.unavailableGuilds) return this.worker.emit('GUILD_CREATE', data)
      
      this.worker.internalEvents.run('GUILD_CREATE', data)

      if (!checkTimeout) {
        checkTimeout = setTimeout(() => {
          this.worker.log(`Shard ${this.id} reported ${this.unavailableGuilds.size} unavailable guilds. Continuing startup.`)
          this._ready()
        }, 15e3)
      } else checkTimeout.refresh()

      this.unavailableGuilds.delete(data.id)

      if (this.unavailableGuilds.size === 0) {
        clearTimeout(checkTimeout)
        this._ready()
      }
    })
  }

  async start (): Promise<void> {
    return new Promise(resolve => {
      this.ws.spawn(resolve)
    })
  }
  
  private _ready () {
    this.worker.emit('SHARD_READY', this)
    this.unavailableGuilds = null
  }

  register () {
    return this.worker.comms.registerShard(this.id)
  }

  restart (kill: boolean, code: number = 1000, reason: string = 'Manually Stopped') {
    if (kill) this.ws.kill()
    else {
      this.ws.resuming = true
    }
    this.ws.ws.close(code, reason)
  }
}
