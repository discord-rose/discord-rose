import { BotOptions } from '../master/Master'
import { Thread } from './Thread'

import { DiscordEventMap } from '../../typings/DiscordEventMap'
import { EventEmitter } from 'events'
import Collection from '@discordjs/collection'

import { Shard } from '../../socket/Shard'
import { GatewayGuildCreateDispatchData, Snowflake } from 'discord-api-types'

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

  public guilds: Collection<Snowflake, GatewayGuildCreateDispatchData>
  
  public comms: Thread = new Thread(this)

  async start (shardNumbers: number[]) {
    this.api = new RestManager(this.options.token)

    for (let i = 0; i < shardNumbers.length; i++) {
      const shard = new Shard(shardNumbers[i], this)
      this.shards.set(shardNumbers[i], shard)
      await shard.register()
    }
  }
}