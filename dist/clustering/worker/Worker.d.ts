import { CompleteBotOptions } from '../master/Master';
import { Thread } from './Thread';
import { DiscordEventMap, CachedGuild, CachedVoiceState } from '../../typings/Discord';
import Collection from '@discordjs/collection';
import { Shard } from '../../socket/Shard';
import { CacheManager } from '../../socket/CacheManager';
import { APIUser, Snowflake, APIGuildMember } from 'discord-api-types';
import { CommandHandler } from '../../structures/CommandHandler';
import { RestManager } from '../../rest/Manager';
import { EventEmitter } from '@jpbberry/typed-emitter';
/**
 * Cluster Worker used on the worker thread
 */
export declare class Worker extends EventEmitter<DiscordEventMap> {
    /**
     * Bot options
     */
    options: CompleteBotOptions;
    /**
     * All shards on this cluster
     */
    shards: Collection<number, Shard>;
    /**
     * Rest manager
     */
    api: RestManager;
    /**
     * Command handler
     */
    commands: CommandHandler;
    /**
     * Thread communications
     */
    comms: Thread;
    /**
     * Cached guilds
     */
    guilds: Collection<Snowflake, CachedGuild>;
    /**
     * Cached roles
     */
    guildRoles: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>>;
    /**
     * Cached channels
     */
    channels: Collection<Snowflake, DiscordEventMap['CHANNEL_CREATE']>;
    /**
     * Cached self members
     */
    selfMember: Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>;
    /**
     * Cached members
     */
    members: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>>;
    /**
     * Cached users
     */
    users: Collection<Snowflake, DiscordEventMap['USER_UPDATE']>;
    /**
     * Cached voice states
     */
    voiceStates: Collection<Snowflake, CachedVoiceState>;
    /**
     * Self user
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
     */
    get ready(): boolean;
    /**
     * Log something to master
     * @param data What to log
     */
    log(...data: any[]): void;
    /**
     * Debug
     * @internal
     * @param msg Debug message
     */
    debug(msg: string): void;
}
