/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { CompleteBotOptions } from '../master/Master'
import { Thread } from './Thread'

import { DiscordEventMap, CachedGuild } from '../../typings/Discord'
import { Emitter } from '../../utils/Emitter'
import Collection from '@discordjs/collection'

import { Shard } from '../../socket/Shard'
import { CacheManager } from '../../socket/CacheManager'

import { APIUser, PresenceUpdateStatus, Snowflake, ActivityType, APIGuildMember } from 'discord-api-types'

import { guildShard } from '../../utils/UtilityFunctions'

import { CommandHandler } from '../../structures/CommandHandler'

import { RestManager } from '../../rest/Manager'

export class Worker extends Emitter<DiscordEventMap> {
  public options: CompleteBotOptions = {} as CompleteBotOptions
  public shards: Collection<number, Shard> = new Collection()

  public api = {} as RestManager
  public commands = new CommandHandler(this)
  public comms: Thread = new Thread(this)

  public guilds: Collection<Snowflake, CachedGuild> = new Collection()
  public guildRoles: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>> = new Collection()
  public channels: Collection<Snowflake, DiscordEventMap['CHANNEL_CREATE']> = new Collection()
  public selfMember: Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']> = new Collection()
  public members: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>> = new Collection()
  public users: Collection<Snowflake, DiscordEventMap['USER_UPDATE']> = new Collection()

  public user = {} as APIUser

  public cacheManager = {} as CacheManager

  async start (shardNumbers: number[]): Promise<void> {
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
  setStatus (type: 'playing' | 'streaming' | 'listening' | 'watching' | 'competing', name: string, status: 'idle' | 'online' | 'dnd' | 'offline' | 'invisible' = 'online', url?: string): void {
    if (!this.ready) return void this.once('READY', () => { this.setStatus(type, name, status) })
    this.shards.forEach(shard => {
      shard.setPresence({
        afk: false,
        since: Date.now(),
        status: status as PresenceUpdateStatus,
        activities: [
          {
            name,
            type: ({
              playing: ActivityType.Game,
              streaming: ActivityType.Streaming,
              listening: ActivityType.Listening,
              watching: ActivityType.Watching,
              competing: ActivityType.Competing
            })[type],
            url
          }
        ]
      })
    })
  }

  /**
   * Gets shard in charge of specific guild
   * @param guildId ID of guild
   */
  guildShard (guildId: Snowflake): Shard {
    const shard = this.shards.get(guildShard(guildId, this.options.shards))
    if (!shard) throw new Error('Guild not on this cluster.')
    return shard
  }

  /**
   * Gets ALL members in a guild (via ws)
   * @param guildId ID of guild
   */
  async getMembers (guildId: Snowflake): Promise<Collection<any, APIGuildMember>> {
    return await this.guildShard(guildId).getGuildMembers({
      guild_id: guildId,
      query: '',
      limit: 0
    })
  }

  /**
   * Whether or not all shards are online and ready
   */
  get ready (): boolean {
    return this.api instanceof RestManager && this.shards.every(x => x.ready)
  }

  log (...data): void {
    this.comms.log(...data)
  }
}
