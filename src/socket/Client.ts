import { BotOptions } from '../clustering/master/Master'
import { Thread } from '../clustering/worker/Thread'

import { DiscordEventMap } from '../typings/DiscordEventMap'
import { EventEmitter } from 'events'
import Collection from '@discordjs/collection'

import { Shard } from './Shard'
import { GatewayGuildCreateDispatchData, Snowflake } from 'discord-api-types'

export default class Client extends EventEmitter {
  on: <K extends keyof DiscordEventMap>(event: K, listener?: (data:  DiscordEventMap[K]) => void) => this

  once: <K extends keyof DiscordEventMap>(event: K, listener?: (data: DiscordEventMap[K]) => void) => this

  emit: <K extends keyof DiscordEventMap>(event: K, data: DiscordEventMap[K]) => boolean

  off: <K extends keyof DiscordEventMap>(event: K, listener?: (data: DiscordEventMap[K]) => void) => this

  removeAllListeners: <K extends keyof DiscordEventMap>(event?: K) => this

  public options: BotOptions
  public shards: Collection<number, Shard> = new Collection()

  public guilds: Collection<Snowflake, GatewayGuildCreateDispatchData>
  
  public comms: Thread = new Thread(this)

  async start (shardNumbers: number[]) {
    for (let i = 0; i < shardNumbers.length; i++) {
      this.shards.set(shardNumbers[i], new Shard(shardNumbers[i], this))
      await this.comms.registerShard(shardNumbers[i])
    }
  }
}