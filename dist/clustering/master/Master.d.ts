import { RestManager } from '../../rest/Manager';
import { APIGatewaySessionStartLimit, Snowflake } from 'discord-api-types';
import { ThreadEvents, ResolveFunction, ClusterStats } from '../ThreadComms';
import Collection from '@discordjs/collection';
import { Cluster } from './Cluster';
import { Sharder } from './Sharder';
import { EventEmitter } from '@jpbberry/typed-emitter';
import { BotOptions, CompleteBotOptions } from '../../typings/options';
/**
 * Master process controller
 */
export declare class Master extends EventEmitter<{
    READY: Master;
    CLUSTER_STARTED: Cluster;
    CLUSTER_STOPPED: Cluster;
    DEBUG: string;
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
    debug(msg: string): void;
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
export declare const Intents: {
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
