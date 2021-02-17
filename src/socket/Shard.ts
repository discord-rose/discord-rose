import Collection from "@discordjs/collection"
import { GatewayGuildCreateDispatchData, GatewayOPCodes, GatewayPresenceUpdateData, GatewayReadyDispatchData, Snowflake } from "discord-api-types"
import { OPEN } from "ws"
import { Worker } from "../typings/lib"
import { DiscordSocket } from './WebSocket'

export class Shard {
  public ping: number = 0

  private ws = new DiscordSocket(this)
  private unavailableGuilds: Collection<Snowflake, {}> | null = null

  constructor (public id: number, public worker: Worker) {
    this.ws.on('READY', (data: GatewayReadyDispatchData) => {
      this.worker.comms.tell('SHARD_READY', { id })

      this.worker.user = data.user

      this.unavailableGuilds = new Collection()

      if (data.guilds.length < 1 || !this.worker.options.cache.guilds) return this._ready()

      data.guilds.forEach(guild => this.unavailableGuilds?.set(guild.id, guild))
    })

    let checkTimeout: NodeJS.Timeout

    this.ws.on('GUILD_CREATE', (data: GatewayGuildCreateDispatchData) => {
      if (!this.unavailableGuilds) return this.worker.emit('GUILD_CREATE', data)
      
      this.worker.cacheManager.run('GUILD_CREATE', data)

      if (!checkTimeout) {
        checkTimeout = setTimeout(() => {
          this.worker.log(`Shard ${this.id} reported ${this.unavailableGuilds?.size} unavailable guilds. Continuing startup.`)
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

  get ready () {
    return this.ws.ws?.readyState === OPEN && !this.unavailableGuilds
  }

  async start (): Promise<void> {
    return new Promise(resolve => {
      this.ws.spawn(resolve)
    })
  }
  
  private _ready () {
    this.worker.emit('SHARD_READY', this)
    this.unavailableGuilds = null

    if (this.worker.shards.every(x => x.unavailableGuilds === null)) this.worker.emit('READY', null)
  }

  register () {
    return this.worker.comms.registerShard(this.id)
  }

  restart (kill: boolean, code: number = 1000, reason: string = 'Manually Stopped') {
    if (kill) this.ws.kill()
    else {
      this.ws.resuming = true
    }
    this.ws.ws?.close(code, reason)
  }

  setPresence (presence: GatewayPresenceUpdateData) {
    this.ws._send({
      op: GatewayOPCodes.PresenceUpdate,
      d: presence
    })
  }
}
