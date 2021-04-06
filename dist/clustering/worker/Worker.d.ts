import { CompleteBotOptions } from '../master/Master';
import { Thread } from './Thread';
import { DiscordEventMap, CachedGuild } from '../../typings/Discord';
import { Emitter } from '../../utils/Emitter';
import Collection from '@discordjs/collection';
import { Shard } from '../../socket/Shard';
import { CacheManager } from '../../socket/CacheManager';
import { APIUser, Snowflake, APIGuildMember } from 'discord-api-types';
import { CommandHandler } from '../../structures/CommandHandler';
import { RestManager } from '../../rest/Manager';
/**
 * Cluster Worker used on the worker thread
 */
export declare class Worker extends Emitter<DiscordEventMap> {
    /**
     * Bot options
     * @type {BotOptions}
     */
    options: CompleteBotOptions;
    /**
     * All shards on this cluster
     * @type {Collection<number, Shard>}
     */
    shards: Collection<number, Shard>;
    /**
     * Rest manager
     * @type {RestManager}
     */
    api: RestManager;
    /**
     * Command handler
     * @type {CommandHandler}
     */
    commands: CommandHandler;
    /**
     * Thread communications
     * @type {Thread}
     */
    comms: Thread;
    /**
     * Cached guilds
     * @type {Collection<Snowflake, CachedGuild>}
     */
    guilds: Collection<Snowflake, CachedGuild>;
    /**
     * Cached roles
     * @type {Collection<Snowflake, Collection<Snowflake, APIRole>>}
     */
    guildRoles: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>>;
    /**
     * Cached channels
     * @type {Collection<Snowflake, APIChannel>}
     */
    channels: Collection<Snowflake, DiscordEventMap['CHANNEL_CREATE']>;
    /**
     * Cached self members
     * @type {Collection<Snowflake, APIGuildMember>}
     */
    selfMember: Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>;
    /**
     * Cached members
     * @type {Collection<Snowflake, Collection<Snowflake, APIGuildMember>>}
     */
    members: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>>;
    /**
     * Cached users
     * @type {Collection<Snowflake, APIUser>}
     */
    users: Collection<Snowflake, DiscordEventMap['USER_UPDATE']>;
    /**
     * Self user
     * @type {APIUser}
     */
    user: APIUser;
    cacheManager: CacheManager;
    start(shardNumbers: number[]): Promise<void>;
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
    setStatus(type: 'playing' | 'streaming' | 'listening' | 'watching' | 'competing', name: string, status?: 'idle' | 'online' | 'dnd' | 'offline' | 'invisible', url?: string): void;
    /**
     * Gets shard in charge of specific guild
     * @param guildId ID of guild
     */
    guildShard(guildId: Snowflake): Shard;
    /**
     * Gets ALL members in a guild (via ws)
     * @param guildId ID of guild
     */
    getMembers(guildId: Snowflake): Promise<Collection<any, APIGuildMember>>;
    /**
     * Whether or not all shards are online and ready
     * @type {boolean}
     */
    get ready(): boolean;
    /**
     * Log something to master
     * @param data What to log
     */
    log(...data: any[]): void;
}
