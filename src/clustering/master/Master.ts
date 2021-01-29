import { RestManager } from '../../rest/Manager'
import { APIGatewayBotInfo } from 'discord-api-types'
import { chunkShards } from '../../utils/UtilityFunctions'

import Collection from '@discordjs/collection'

import { Cluster } from './Cluster'
import { Sharder } from './Sharder'

import path from 'path'

/**
 * Master process controller
 */
export default class Master {
  public options: BotOptions
  private rest: RestManager

  public sharder = new Sharder(this)
  public chunks: number[][]
  public clusters: Collection<string, Cluster> = new Collection()
  public fileName: string
  public spawned: boolean = false
  
  public log: (msg: string) => void

  /**
   * Creates a new Master instance
   * @param fileName Location of Worker file
   * @param options Options
   */
  constructor (fileName: string, options: BotOptions) {
    if (!fileName) throw new Error('Please provide the file name for the Worker')
    if (!options.token) throw new TypeError('Expected options.token')

    this.fileName = path.isAbsolute(fileName) ? fileName : path.resolve(process.cwd(), fileName)

    this.options = {
      token: options.token,
      shards: options.shards || 'auto',
      shardsPerCluster: options.shardsPerCluster || 5,
      shardOffset: options.shardOffset || 0,
      cache: options.cache || {},
      ws: options.ws || null
    }

    this.log = options.log ?? console.log

    this.log('Starting Master.')
  }

  /**
   * Starts the bot and spawns workers
   */
  async start () {
    this.rest = new RestManager(this.options.token)

    const gatewayRequest: APIGatewayBotInfo = await this.rest.request('GET', '/gateway/bot')

    if (!this.options.ws) this.options.ws = gatewayRequest.url

    if (this.options.shards === 'auto') this.options.shards = gatewayRequest.shards
    this.options.shards += this.options.shardOffset
    this.log(`Spawning ${this.options.shards} shards.`)

    this.chunks = chunkShards(this.options.shards, this.options.shardsPerCluster)

    const promises = []

    for (let i = 0; i < this.chunks.length; i++) {
      const cluster = new Cluster(`${i}`, this)
      this.clusters.set(`${i}`, cluster)

      promises.push(cluster.spawn())
    }

    await Promise.all(promises)
    this.log('All clusters have been spawned, registering shards.')

    await Promise.all(this.clusters.map(x => x.start()))

    this.log('All shards registered, spawning.')
    await this.sharder.loop()

    this.log('Finished spawning')

    this.spawned = true
  }

  shardToCluster (id: number) {
    for (let i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].includes(id)) return this.clusters.get(`${i}`)
    }
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
  /**
   * URL for Discord Gateway (leave null for auto)
   */
  ws?: string
}