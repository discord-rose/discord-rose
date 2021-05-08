import Collection from '@discordjs/collection'
import { APIGuildMember, GatewayGuildMemberAddDispatchData, GatewayGuildMembersChunkDispatchData, GatewayOPCodes, GatewayPresenceUpdateData, GatewayRequestGuildMembersData, Snowflake } from 'discord-api-types'
import { OPEN } from 'ws'
import { State } from '../clustering/ThreadComms'
import { Worker } from '../typings/lib'
import { DiscordSocket } from './WebSocket'

/**
 * Utility manager for a shard
 */
export class Shard {
  /**
   * Ping in ms
   */
  public ping: number = 0

  private ws = new DiscordSocket(this)
  private unavailableGuilds: Collection<Snowflake, {}> | null = null
  private registered = false

  constructor (public id: number, public worker: Worker) {
    this.ws.on('READY', (data) => {
      if (!data) return
      this.worker.comms.tell('SHARD_READY', { id })

      this.worker.user = data.user

      this.unavailableGuilds = new Collection()

      if (data.guilds.length < 1 || !this.worker.options.cache.guilds) return this._ready()

      data.guilds.forEach(guild => this.unavailableGuilds?.set(guild.id, guild))
    })

    let checkTimeout: NodeJS.Timeout

    this.ws.on('GUILD_CREATE', (data) => {
      this.worker.cacheManager.emit('GUILD_CREATE', data)

      if (!this.unavailableGuilds) return this.worker.emit('GUILD_CREATE', data)

      if (!checkTimeout) {
        checkTimeout = setTimeout(() => {
          if (!this.unavailableGuilds) return
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

  /**
   * Current shard state
   * @type {State} 0 = Disconnected, 1 = Connecting, 2 = Connected
   */
  get state (): State {
    if (this.ready) return State.CONNECTED
    if (this.registered || this.unavailableGuilds) return State.CONNECTING

    return State.DISCONNECTED
  }

  /**
   * Whether or not the shard is READY
   */
  get ready (): boolean {
    return this.ws.ws?.readyState === OPEN && !this.unavailableGuilds
  }

  start (): void {
    this.registered = false
    void this.ws.spawn()
  }

  private _ready (): void {
    this.worker.emit('SHARD_READY', this)
    this.unavailableGuilds = null

    if (this.worker.shards.every(x => x.unavailableGuilds === null)) this.worker.emit('READY', null)
  }

  async register (): Promise<{}> {
    this.registered = true
    return await this.worker.comms.registerShard(this.id)
  }

  restart (kill: boolean, code: number = 1000, reason: string = 'Manually Stopped'): void {
    if (kill) this.ws.kill()
    else {
      this.ws.resuming = true
    }
    this.ws.ws?.close(code, reason)
  }

  setPresence (presence: GatewayPresenceUpdateData): void {
    this.ws._send({
      op: GatewayOPCodes.PresenceUpdate,
      d: presence
    })
  }

  async getGuildMembers (opts: GatewayRequestGuildMembersData): Promise<Collection<Snowflake, APIGuildMember>> {
    return await new Promise(resolve => {
      const members: Collection<Snowflake, APIGuildMember> = new Collection()
      const listener = (data: GatewayGuildMembersChunkDispatchData): void => {
        if (data.guild_id !== opts.guild_id) return

        data.members.forEach((member: GatewayGuildMemberAddDispatchData) => {
          if (!member.user) return
          members.set(member.user.id, member)
          member.guild_id = opts.guild_id
          this.worker.cacheManager.emit('GUILD_MEMBER_ADD', member)
        })

        if (data.chunk_index === (data.chunk_count ?? 0) - 1) {
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
