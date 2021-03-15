import { RestManager } from '../../rest/Manager'
import { APIGatewaySessionStartLimit, Snowflake } from 'discord-api-types'
import { DiscordEventMap, CachedGuild } from '../../typings/Discord'

import { chunkShards, guildShard } from '../../utils/UtilityFunctions'

import { ThreadEvents, ResolveFunction } from '../ThreadComms'

import Collection from '@discordjs/collection'

import { Cluster } from './Cluster'
import { Sharder } from './Sharder'
import handlers from './handlers'

import { EventEmitter } from 'events'

import path from 'path'
import { Emitter } from '../../utils/Emitter'

type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : (T[P] | undefined);
}

export interface CompleteBotOptions extends Complete<BotOptions> {
  cache: Complete<CacheOptions>,
  cacheControl: Complete<CacheControlOptions>
  ws: string
}

/**
 * Master process controller
 */
export class Master extends Emitter<{
  READY: Master
  CLUSTER_STARTED: Cluster
  CLUSTER_STOPPED: Cluster
}> {
  public options: CompleteBotOptions = {} as CompleteBotOptions
  public rest = {} as RestManager
  public handlers = new EventEmitter() as {
    on: <K extends keyof ThreadEvents>(event: K, listener: (cluster: Cluster, data: ThreadEvents[K]['send'], resolve: ResolveFunction<K>) => void) => any
  
    emit<K extends keyof ThreadEvents>(event: K, cluster: Cluster, data: ThreadEvents[K]['send'], resolve: ResolveFunction<K>): boolean
  }

  public sharder = new Sharder(this)
  public chunks: number[][] = [[]]
  public clusters: Collection<string, Cluster> = new Collection()
  public fileName: string
  public spawned: boolean = false

  public session: APIGatewaySessionStartLimit
  
  public log: (msg: string, cluster?: Cluster) => void

  private _clusterNames = [] as string[]
  private longestName = 1 as number

  /**
   * Creates a new Master instance
   * @param fileName Location of Worker file
   * @param options Options
   */
  constructor (fileName: string, options: BotOptions) {
    super()

    if (!fileName) throw new Error('Please provide the file name for the Worker')
    if (!options.token) throw new TypeError('Expected options.token')

    this.fileName = path.isAbsolute(fileName) ? fileName : path.resolve(process.cwd(), fileName)

    this.options = {
      token: options.token,
      shards: options.shards,
      shardsPerCluster: options.shardsPerCluster || 5,
      shardOffset: options.shardOffset || 0,
      cache: options.cache === false ? {
        guilds: false,
        roles: false,
        channels: false,
        self: false,
        members: false,
        messages: false,
        users: false
      } : {
        guilds: options.cache?.guilds ?? true,
        roles: options.cache?.roles ?? true,
        channels: options.cache?.channels ?? true,
        self: options.cache?.self ?? true,
        members: options.cache?.members ?? false,
        messages: options.cache?.messages ?? false,
        users: options.cache?.users ?? false
      },
      cacheControl: options.cacheControl as Complete<CacheControlOptions> ?? {
        channels: false,
        guilds: false,
        members: false,
        roles: false
      },
      ws: options.ws || '',
      intents: Array.isArray(options.intents)
        ? options.intents.reduce((a, b) => a | Intents[b], 0)
        : options.intents === true
          ? Object.values(Intents).reduce((a, b) => a | b, 0)
          : options.intents
            ? options.intents
            : Object.values(Intents).reduce((a, b) => a | b) &~ Intents['GUILD_MEMBERS'] &~ Intents['GUILD_PRESENCES'],
      warnings: {
        cachedIntents: options.warnings?.cachedIntents ?? true
      },
      log: options.log
    }

    this.log = typeof options.log === 'undefined' ? (msg, cluster) => {
      console.log(`${cluster ? `Cluster ${cluster.id}${' '.repeat(this.longestName - cluster.id.length)}` : `Master ${' '.repeat(this.longestName + 1)}`} | ${msg}`)
    } : options.log
    if (!this.log) this.log = () => {}

    if (this.options.warnings && this.options.warnings.cachedIntents) {
      const warn = (key: string, intent: string) => console.warn(`WARNING: CacheOptions.${key} was turned on, but is missing the ${intent} intent. Meaning your cache with be empty. Either turn this on, or if it's intentional set Options.warnings.cachedIntents to false.`)

      if (this.options.cache.guilds && (((this.options.intents as number) & Intents.GUILDS) === 0)) warn('guilds', 'GUILDS')
      if (this.options.cache.roles && (((this.options.intents as number) & Intents.GUILDS) === 0)) warn('roles', 'GUILDS')
      if (this.options.cache.channels && (((this.options.intents as number) & Intents.GUILDS) === 0)) warn('channels', 'GUILDS')
      if (this.options.cache.members && (((this.options.intents as number) & Intents.GUILD_MEMBERS) === 0)) warn('members', 'GUILD_MEMBERS')
      if (this.options.cache.messages && (((this.options.intents as number) & Intents.GUILD_MESSAGES) === 0)) warn('messages', 'GUILD_MESSAGES')
    }

    const keys = Object.keys(handlers)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof ThreadEvents

      this.handlers.on(key, (shard, ...data) => handlers[key].bind(shard)(...data))
    }
  }

  /**
   * Spawns a custom process
   * @param name Name of the process (especially for logging)
   * @param fileName Direct path for process
   */
  spawnProcess (name: string, fileName: string) {
    this._clusterNames.push(name)
    this.longestName = this._clusterNames.reduce((a, b) => a.length > b.length ? a : b, '').length

    const cluster = new Cluster(name, this, fileName, true)
    cluster.spawn()

    return cluster
  }

  /**
   * Starts the bot and spawns workers
   */
  async start () {
    this.rest = new RestManager(this.options.token)

    const gatewayRequest = await this.rest.misc.getGateway()
    this.session = gatewayRequest.session_start_limit

    if (!this.options.ws) this.options.ws = gatewayRequest.url

    if (this.options.shards === 'auto') this.options.shards = gatewayRequest.shards
    if (typeof this.options.shards !== 'number') this.options.shards = 1
    this.options.shards += this.options?.shardOffset || 0
    this.log(`Spawning ${this.options.shards} shards.`)

    this.chunks = chunkShards(this.options?.shards || 1, this.options.shardsPerCluster || 5)

    const promises: Promise<void>[] = []

    for (let i = 0; i < this.chunks.length; i++) {
      const cluster = new Cluster(`${i}`, this)
      this.clusters.set(`${i}`, cluster)

      this._clusterNames.push(`${i}`)
      this.longestName = this._clusterNames.reduce((a, b) => a.length > b.length ? a : b, '').length

      promises.push(cluster.spawn())
    }

    await Promise.all(promises)
    this.log('Registering shards')

    await Promise.all(this.clusters.map(x => x.start()))

    this.log('Spawning')
    await this.sharder.loop()

    this.log('Finished spawning')

    this.spawned = true
    this.emit('READY', this)
  }

  /**
   * Sends an event to all clusters
   * @param event Event name
   * @param data Event data
   */
  sendToAll<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): Promise<ThreadEvents[K]['receive'][]> {
    return Promise.all(this.clusters.map(x => x.sendCommand(event, data)))
  }

  /**
   * Sends a TELL event to all clusters
   * @param event Event name
   * @param data Event data
   */
  tellAll<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): void[] {
    return this.clusters.map(x => x.tell(event, data))
  }

  /**
   * Evals code on every cluster
   * @param code Code to eval
   */
  broadcastEval (code: string) {
    return this.sendToAll('EVAL', code)
  }

  /**
   * Gets each clusters stats
   */
  getStats () {
    return this.sendToAll('GET_STATS', null)
  }

  shardToCluster (shardId: number) {
    for (let i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].includes(shardId)) return this.clusters.get(`${i}`)
    }
  }

  guildToShard (guildId: Snowflake) {
    return guildShard(guildId, this.options.shards as number)
  }

  guildToCluster (guildId: Snowflake) {
    return this.shardToCluster(this.guildToShard(guildId))
  }
}

interface CacheOptions {
  guilds?: boolean
  roles?: boolean
  channels?: boolean
  self?: boolean
  members?: boolean
  messages?: boolean
  users?: boolean
}

interface CacheControlOptions {
  guilds?: (keyof CachedGuild)[] | false
  roles?: (keyof DiscordEventMap['GUILD_ROLE_CREATE']['role'])[] | false
  channels?: (keyof DiscordEventMap['CHANNEL_CREATE'])[] | false
  members?: (keyof DiscordEventMap['GUILD_MEMBER_ADD'])[] | false
}

const Intents = {
  'GUILDS': 1 << 0,
  'GUILD_MEMBERS': 1 << 1,
  'GUILD_BANS': 1 << 2,
  'GUILD_EMOJIS': 1 << 3,
  'GUILD_INTEGRATIONS': 1 << 4,
  'GUILD_WEBHOOKS': 1 << 5,
  'GUILD_INVITES': 1 << 6,
  'GUILD_VOICE_STATES': 1 <<  7,
  'GUILD_PRESENCES': 1 << 8,
  'GUILD_MESSAGES': 1 << 9,
  'GUILD_MESSAGE_REACTIONS': 1 << 10,
  'GUILD_MESSAGE_TYPING': 1 << 11,
  'DIRECT_MESSAGES': 1 << 12,
  'DIRECT_MESSAGE_REACTIONS': 1 << 13,
  'DIRECT_MESSAGE_TYPING': 1 << 14
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
   * Array of intents to enable if true, enables all, if undefined enables all non-priveleged intents.
   */
  intents?: true | number | (keyof typeof Intents)[]
  /**
   * Amount of shards to add after requesting shards
   */
  shardOffset?: number
  /**
   * Cache options, this also sets your intents.
   */
  cache?: CacheOptions
  /**
   * Cache control option, to control what properties are cached
   */
  cacheControl?: CacheControlOptions
  /**
   * Custom logging function (false to disable)
   * @default console.log
   */
  log?: (msg: string) => void
  /**
   * URL for Discord Gateway (leave null for auto)
   */
  ws?: string
  /**
   * Whether or not to log warnings for certain things
   */
  warnings?: {
    /**
     * Whether or not warn when cache is enabled but it's required intents are not
     */
    cachedIntents: boolean
  }
}