import { ChannelType } from 'discord-api-types';
import { Cluster } from '../clustering/master/Cluster';
import { Intents } from '../clustering/master/Master';
import { RestManagerOptions } from '../rest/Manager';
import { CachedGuild, DiscordEventMap } from './Discord';
declare type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : DeepPartial<T[P]>;
};
export interface BaseBotOptions {
    /**
   * Discord Bot Token.
   */
    token: string;
    /**
     * Amount of shards to spawn, leave to auto to let Discord decide.
     */
    shards: 'auto' | number;
    /**
     * Amount of shards per cluster worker.
     * @default 5
     */
    shardsPerCluster: number;
    /**
     * Array of intents to enable if true, enables all, if undefined enables all non-priveleged intents.
     */
    intents: true | number | Array<keyof typeof Intents>;
    /**
     * Amount of shards to add after requesting shards
     */
    shardOffset: number;
    /**
     * Cache options, decide what to cache
     */
    cache: CacheOptions | false;
    /**
     * Cache control option, to control what properties are cached
     */
    cacheControl: CacheControlOptions;
    /**
     * Custom logging function (false to disable)
     * @default console.log
     */
    log: (msg: string, cluster: Cluster) => void;
    /**
     * URL for Discord Gateway (leave null for auto)
     */
    ws: string;
    /**
     * Whether or not to log warnings for certain things
     */
    warnings: {
        /**
         * Whether or not warn when cache is enabled but it's required intents are not
         */
        cachedIntents: boolean;
    };
    /**
     * Options to be passed to the rest manager on every worker
     */
    rest: RestManagerOptions;
    /**
     * Amount of time between when shards are spawned (don't change unless you know what you're doing)
     * @default 5100
     */
    spawnTimeout: number;
    /**
     * Amount of time to try asking the cluster to start before giving up and respawning
     * @default 3
     */
    clusterStartRetention: number;
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
    guilds: boolean;
    /**
     * Caches roles
     * @default true
     * @sets Worker.guildRoles = Collection<Snowflake (Guild ID), Collection<Snowflake (Role ID), APIRole>>
     */
    roles: boolean;
    /**
     * Caches channels, can also be an array of channel type categories
     * @default true
     * @sets Worker.channels = Collection<Snowflake (Channel ID), APIChannel>
     */
    channels: boolean | Array<'text' | 'voice' | 'category'> | ChannelType[] | true;
    /**
     * Caches self member
     * @default true
     * @sets Worker.selfMember = Collection<Snowflake (Guild ID), APIMember>
     */
    self: boolean;
    /**
     * Caches members
     * @default false
     * @sets Worker.members = Collection<Snowflake (Guild ID), Collection<Snowflake (User ID), APIMember>>
     */
    members: boolean;
    /**
     * Caches messages
     * @default false
     * @sets Worker.messages = Collection<Snowflake (Channel ID), Collection<Snowflake (Message ID), APIMessage>>
     */
    messages: boolean;
    /**
     * Caches users
     * @default false
     * @sets Worker.users = Collection<Snowflake (User ID), APIUser>
     */
    users: boolean;
    /**
     * Caches voices states
     * @default false
     * @sets Worker.voiceStates = Collection<Snowflake (Channel ID), CachedVoiceState>
     */
    voiceStates: boolean;
}
/**
 * Changes what properties of a cache should be kept
 */
export interface CacheControlOptions {
    guilds: Array<keyof CachedGuild> | false;
    roles: Array<keyof DiscordEventMap['GUILD_ROLE_CREATE']['role']> | false;
    channels: Array<keyof DiscordEventMap['CHANNEL_CREATE']> | false;
    members: Array<keyof DiscordEventMap['GUILD_MEMBER_ADD']> | false;
    voiceStates: Array<keyof DiscordEventMap['VOICE_STATE_UPDATE']> | false;
}
interface CompleteCacheOptions extends CacheOptions {
    channels: ChannelType[] | true;
}
export interface CompleteBotOptions extends BaseBotOptions {
    shards: number;
    cache: CompleteCacheOptions;
    intents: number;
}
export interface BotOptions extends DeepPartial<BaseBotOptions> {
    token: string;
}
export {};
