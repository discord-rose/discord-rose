import { BotOptions } from '../master/Master'
import { Thread } from './Thread'

import { DiscordEventMap, CachedGuild } from '../../typings/Discord'
import { EventEmitter } from 'events'
import Collection from '@discordjs/collection'

import { Shard } from '../../socket/Shard'
import { CacheManager } from '../../socket/CacheManager'

import { ActivityType, APIUser, PresenceUpdateStatus, Snowflake } from 'discord-api-types'

import { CommandHandler } from '../../structures/CommandHandler'

import { RestManager } from '../../rest/Manager'

export default class Worker extends EventEmitter {
  on: <K extends keyof DiscordEventMap>(event: K, listener?: (data:  DiscordEventMap[K]) => void) => this

  once: <K extends keyof DiscordEventMap>(event: K, listener?: (data: DiscordEventMap[K]) => void) => this

  emit: <K extends keyof DiscordEventMap>(event: K, data: DiscordEventMap[K]) => boolean

  off: <K extends keyof DiscordEventMap>(event: K, listener?: (data: DiscordEventMap[K]) => void) => this

  removeAllListeners: <K extends keyof DiscordEventMap>(event?: K) => this

  public options: BotOptions
  public shards: Collection<number, Shard> = new Collection()

  public api: RestManager
  public commands = new CommandHandler(this)
  public comms: Thread = new Thread(this)

  public guilds: Collection<Snowflake, CachedGuild>
  public guildRoles: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>>
  public channels: Collection<Snowflake, DiscordEventMap['CHANNEL_CREATE']>
  public selfMember: Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>
  public members: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>>

  public user: APIUser

  public cacheManager: CacheManager

  async start (shardNumbers: number[]) {
    this.api = new RestManager(this.options.token)
    this.cacheManager = new CacheManager(this)

    for (let i = 0; i < shardNumbers.length; i++) {
      const shard = new Shard(shardNumbers[i], this)
      this.shards.set(shardNumbers[i], shard)
      await shard.register()
    }
  }

  /**
   * Sets the status of the client
   * @param type Type of status, e.g "playing" is "Playing Game!"
   * @param name Name of status, in this case Game
   * @param status Status type
   * @param url Optional url for twitch stream
   * @example
   * worker.setStatus('playing', 'Rocket League', 'online') // Playing Rocket League
   * // Twitch streams
   * worker.setStatus('streaming', 'Rocket League', 'online', 'https://twitch.com/jpbberry')
   */
  setStatus (type: 'playing' | 'streaming' | 'listening' | 'competing', name: string, status: 'idle' | 'online' | 'dnd' | 'offline' | 'invisible' = 'online', url?: string) {
    if (!this.ready) this.once('READY', () => { this.setStatus(type, name, status) })
    this.shards.forEach(shard => {
      shard.setPresence({
        afk: false,
        since: Date.now(),
        status: status as PresenceUpdateStatus,
        activities: [
          {
            name,
            type: ({
              playing: 0,
              streaming: 1,
              listening: 2,
              competing: 5
            })[type],
            url
          }
        ]
      })
    })
  }

  get ready () {
    return this.api && this.shards.every(x => x.ready)
  }

  log (data: string) {
    this.comms.tell('LOG', data)
  }
}