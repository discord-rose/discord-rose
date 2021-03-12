import Collection from "@discordjs/collection"
import { APIGuildMember, GatewayGuildMemberAddDispatchData, GatewayGuildMembersChunkDispatchData, GatewayOPCodes, GatewayPresenceUpdateData, GatewayRequestGuildMembersData, Snowflake } from "discord-api-types"
import { OPEN } from "ws"
import { State } from "../clustering/ThreadComms"
import { Worker } from "../typings/lib"
import { DiscordSocket } from './WebSocket'

export class Shard {
  public ping: number = 0

  private ws = new DiscordSocket(this)
  private unavailableGuilds: Collection<Snowflake, {}> | null = null
  private registered = false

  constructor (public id: number, public worker: Worker) {
    this.ws.on('READY', (data) => {
      this.worker.comms.tell('SHARD_READY', { id })

      this.worker.user = data.user

      this.unavailableGuilds = new Collection()

      if (data.guilds.length < 1 || !this.worker.options.cache.guilds) return this._ready()

      data.guilds.forEach(guild => this.unavailableGuilds?.set(guild.id, guild))
    })

    let checkTimeout: NodeJS.Timeout

    this.ws.on('GUILD_CREATE', (data) => {
      if (!this.unavailableGuilds) return this.worker.emit('GUILD_CREATE', data)
      
      this.worker.cacheManager.emit('GUILD_CREATE', data)

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

  /**
   * Current shard state, 0 = Disconnected, 1 = Connecting, 2 = Connected
   */
  get state (): State {
    if (this.ready) return State.CONNECTED
    if (this.registered || this.unavailableGuilds) return State.CONNECTING

    return State.DISCONNECTED
  }

  /**
   * Whether or not the shard is READY
   */
  get ready () {
    return this.ws.ws?.readyState === OPEN && !this.unavailableGuilds
  }

  async start (): Promise<void> {
    this.registered = false
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
    this.registered = true
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

  getGuildMembers (opts: GatewayRequestGuildMembersData): Promise<Collection<Snowflake, APIGuildMember>> {
    return new Promise(resolve => {
      const members: Collection<Snowflake, APIGuildMember> = new Collection()
      const listener = (data: GatewayGuildMembersChunkDispatchData) => {
        if (data.guild_id !== opts.guild_id) return

        data.members.forEach(member => {
          if (!member.user) return
          members.set(member.user.id, member);
          (member as GatewayGuildMemberAddDispatchData).guild_id = opts.guild_id
          this.worker.cacheManager.emit('GUILD_MEMBER_ADD', member as GatewayGuildMemberAddDispatchData)
        })

        if (data.chunk_index === (data.chunk_count || 0) - 1) {
          this.worker.off('GUILD_MEMBERS_CHUNK', listener)

          resolve(members)
        }
      }
      this.worker.on('GUILD_MEMBERS_CHUNK', listener)
      this.ws._send({
        op: GatewayOPCodes.RequestGuildMembers,
        d: opts
      })
    })
  }
}
