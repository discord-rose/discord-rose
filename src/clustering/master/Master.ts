import { RestManager } from '../../rest/Manager'
import { APIGatewayBotInfo } from 'discord-api-types'
import { chunkShards } from '../../utils/UtilityFunctions'

import Collection from '@discordjs/collection'

import { Cluster } from './Cluster'

export default class Master {
  private options: BotOptions
  private rest: RestManager

  public chunks: number[][]
  public clusters: Collection<string, Cluster> = new Collection()
  public fileName: string
  
  public log: (msg: string) => void

  constructor (fileName: string, options: BotOptions) {
    if (!fileName) throw new Error('Please provide the file name for the Worker')
    if (!options.token) throw new TypeError('Expected options.token')

    this.fileName = fileName

    this.options = {
      token: options.token,
      shards: options.shards || 'auto',
      shardsPerCluster: options.shardsPerCluster || 5,
      shardOffset: options.shardOffset || 0,
      cache: options.cache || {}
    }

    this.log = options.log ?? console.log

    this.log('Starting Master.')
  }

  async start () {
    this.rest = new RestManager(this.options.token)

    const gatewayRequest: APIGatewayBotInfo = await this.rest.request('GET', '/gateway/bot')

    if (this.options.shards === 'auto') this.options.shards = gatewayRequest.shards
    this.options.shards += this.options.shardOffset
    this.log(`Spawning ${this.options.shards} shards.`)

    this.chunks = chunkShards(this.options.shards, this.options.shardsPerCluster)

    const promises = []

    for (let i = 0; i < this.chunks.length; i++) {
      const cluster = new Cluster(`${i}`, this)
      this.clusters.set(`${i}`, cluster)

      promises.push(cluster.start())
    }

    await Promise.all(promises)
    this.log('All clusters have been spawned, registering shards.')
  }
}

interface CacheOptions {
  guilds?: boolean
  channels?: boolean
  roles?: boolean
  messages?: boolean
}

export interface BotOptions {
  /**
   * Discord Bot Token.
   */
  token: string
  /**
   * Amount of shards to spawn, leave to auto to let Discord decide.
   */
  shards?: 'auto' | number
  /**
   * Amount of shards per cluster worker.
   * @default 5
   */
  shardsPerCluster?: number
  /**
   * Amount of shards to add after requesting shards
   */
  shardOffset?: number
  /**
   * Cache options, this also sets your intents.
   */
  cache?: CacheOptions
  /**
   * Custom logging function (false to disable)
   * @default console.log
   */
  log?: (msg: string) => void
}