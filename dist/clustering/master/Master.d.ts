import { RestManager, RestManagerOptions } from '../../rest/Manager';
import { APIGatewaySessionStartLimit, ChannelType, Snowflake } from 'discord-api-types';
import { DiscordEventMap, CachedGuild } from '../../typings/Discord';
import { ThreadEvents, ResolveFunction, ClusterStats } from '../ThreadComms';
import Collection from '@discordjs/collection';
import { Cluster } from './Cluster';
import { Sharder } from './Sharder';
import { EventEmitter } from '@jpbberry/typed-emitter';
declare type Complete<T> = {
    [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : (T[P] | undefined);
};
interface CompleteCacheOptions extends Complete<CacheOptions> {
    channels: ChannelType[] | true;
}
export interface CompleteBotOptions extends Complete<BotOptions> {
    cache: CompleteCacheOptions;
    cacheControl: Complete<CacheControlOptions>;
    ws: string;
    shards: number;
    shardsPerCluster: number;
    intents: number;
    spawnTimeout: number;
}
/**
 * Master process controller
 */
export declare class Master extends EventEmitter<{
    READY: Master;
    CLUSTER_STARTED: Cluster;
    CLUSTER_STOPPED: Cluster;
}> {
    /**
     * Options
     */
    options: CompleteBotOptions;
    /**
     * Rest Manager (only set after running .start())
     */
    rest: RestManager;
    /**
     * Handler emitter
     * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
     */
    handlers: {
        on: <K extends keyof ThreadEvents>(event: K, listener: (cluster: Cluster, data: ThreadEvents[K]["send"], resolve: ResolveFunction<K>) => void) => any;
        emit: <K_1 extends keyof ThreadEvents>(event: K_1, cluster: Cluster, data: ThreadEvents[K_1]["send"], resolve: ResolveFunction<K_1>) => boolean;
    };
    /**
     * Sharding manager for handling shard ratelimits
     */
    sharder: Sharder;
    /**
     * Chunked Numbers for shards / cluster
     */
    chunks: number[][];
    /**
     * Process list (including custom processes)
     */
    processes: Collection<string, Cluster>;
    /**
     * File name to spawn with
     */
    fileName: string;
    /**
     * Whether or not the master has been spawned
     */
    spawned: boolean;
    /**
     * Session data (Set after .start())
     */
    session: APIGatewaySessionStartLimit;
    /**
     * Log function
     */
    log: (msg: string, cluster?: Cluster) => void;
    private readonly _clusterNames;
    private longestName;
    /**
     * Creates a new Master instance
     * @param fileName Location of Worker file
     * @param options Options
     */
    constructor(fileName: string, options: BotOptions);
    /**
     * Get all Discord Bot clusters (discludes custom processes)
     */
    get clusters(): Collection<string, Cluster>;
    /**
     * Spawns a custom process
     * @param name Name of the process (especially for logging)
     * @param fileName Direct path for process
     * @returns The new Cluster thread created
     */
    spawnProcess(name: string, fileName: string): Cluster;
    /**
     * Starts the bot and spawns workers
     */
    start(): Promise<void>;
    /**
     * Sends an event to all clusters
     * @param event Event name
     * @param data Event data
     * @param all Whether or not to send to all processes, including custom ones
     * @returns The data sent back
     */
    sendToAll<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send'], all?: boolean): Promise<Array<ThreadEvents[K]['receive']>>;
    /**
     * Sends a TELL event to all clusters
     * @param event Event name
     * @param data Event data
     * @param all Whether or not to send to all processes, including custom ones
     * @returns Nothing
     */
    tellAll<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send'], all?: boolean): any[];
    /**
     * Evals code on every cluster
     * @param code Code to eval
     * @returns An array of responses
     */
    broadcastEval(code: string): Promise<any[]>;
    /**
     * Gets each clusters stats
     * @returns Stats
     */
    getStats(): Promise<ClusterStats[]>;
    /**
     * Convert a shard ID into it's containing cluster
     * @param shardId Shard ID to convert to
     * @returns The cluster the shard belongs to
     */
    shardToCluster(shardId: number): Cluster;
    /**
     * Get the shard that has a certain guild
     * @param guildId ID of guild
     * @returns ID of shard
     */
    guildToShard(guildId: Snowflake): number;
    /**
     * Get a cluster based on the guild that should be cached there
     * @param guildId Guild ID
     * @returns Cluster guild belongs to
     */
    guildToCluster(guildId: Snowflake): Cluster;
}
/**
 * Change what to cache
 */
export interface CacheOptions {
    /**
     * Caches guilds
     * @default true
     * @sets Worker.guilds = Collection<Snowflake (Guild ID), APIGuild>
     */
    guilds?: boolean;
    /**
     * Caches roles
     * @default true
     * @sets Worker.guildRoles = Collection<Snowflake (Guild ID), Collection<Snowflake (Role ID), APIRole>>
     */
    roles?: boolean;
    /**
     * Caches channels, can also be an array of channel type categories
     * @default true
     * @sets Worker.channels = Collection<Snowflake (Channel ID), APIChannel>
     */
    channels?: boolean | Array<'text' | 'voice' | 'category'> | ChannelType[] | true;
    /**
     * Caches self member
     * @default true
     * @sets Worker.selfMember = Collection<Snowflake (Guild ID), APIMember>
     */
    self?: boolean;
    /**
     * Caches members
     * @default false
     * @sets Worker.members = Collection<Snowflake (Guild ID), Collection<Snowflake (User ID), APIMember>>
     */
    members?: boolean;
    /**
     * Caches messages
     * @default false
     * @sets Worker.messages = Collection<Snowflake (Channel ID), Collection<Snowflake (Message ID), APIMessage>>
     */
    messages?: boolean;
    /**
     * Caches users
     * @default false
     * @sets Worker.users = Collection<Snowflake (User ID), APIUser>
     */
    users?: boolean;
    /**
     * Caches voices states
     * @default false
     * @sets Worker.voiceStates = Collection<Snowflake (Channel ID), CachedVoiceState>
     */
    voiceStates?: boolean;
}
/**
 * Changes what properties of a cache should be kept
 */
export interface CacheControlOptions {
    guilds?: Array<keyof CachedGuild> | false;
    roles?: Array<keyof DiscordEventMap['GUILD_ROLE_CREATE']['role']> | false;
    channels?: Array<keyof DiscordEventMap['CHANNEL_CREATE']> | false;
    members?: Array<keyof DiscordEventMap['GUILD_MEMBER_ADD']> | false;
}
declare const Intents: {
    GUILDS: number;
    GUILD_MEMBERS: number;
    GUILD_BANS: number;
    GUILD_EMOJIS: number;
    GUILD_INTEGRATIONS: number;
    GUILD_WEBHOOKS: number;
    GUILD_INVITES: number;
    GUILD_VOICE_STATES: number;
    GUILD_PRESENCES: number;
    GUILD_MESSAGES: number;
    GUILD_MESSAGE_REACTIONS: number;
    GUILD_MESSAGE_TYPING: number;
    DIRECT_MESSAGES: number;
    DIRECT_MESSAGE_REACTIONS: number;
    DIRECT_MESSAGE_TYPING: number;
};
export interface BotOptions {
    /**
     * Discord Bot Token.
     */
    token: string;
    /**
     * Amount of shards to spawn, leave to auto to let Discord decide.
     */
    shards?: 'auto' | number;
    /**
     * Amount of shards per cluster worker.
     * @default 5
     */
    shardsPerCluster?: number;
    /**
     * Array of intents to enable if true, enables all, if undefined enables all non-priveleged intents.
     */
    intents?: true | number | Array<keyof typeof Intents>;
    /**
     * Amount of shards to add after requesting shards
     */
    shardOffset?: number;
    /**
     * Cache options, decide what to cache
     */
    cache?: CacheOptions;
    /**
     * Cache control option, to control what properties are cached
     */
    cacheControl?: CacheControlOptions;
    /**
     * Custom logging function (false to disable)
     * @default console.log
     */
    log?: (msg: string, cluster?: Cluster) => void;
    /**
     * URL for Discord Gateway (leave null for auto)
     */
    ws?: string;
    /**
     * Whether or not to log warnings for certain things
     */
    warnings?: {
        /**
         * Whether or not warn when cache is enabled but it's required intents are not
         */
        cachedIntents?: boolean;
    };
    /**
     * Options to be passed to the rest manager on every worker
     */
    rest?: RestManagerOptions;
    /**
     * Amount of time between when shards are spawned (don't change unless you know what you're doing)
     * @default 5100
     */
    spawnTimeout?: number;
}
export {};
