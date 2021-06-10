import Collection from '@discordjs/collection';
import { EventEmitter } from '@jpbberry/typed-emitter';
import { APIGuildMember, GatewayPresenceUpdateData, GatewayRequestGuildMembersData, Snowflake } from 'discord-api-types';
import { State } from '../clustering/ThreadComms';
import { DiscordDefaultEventMap } from '../typings/Discord';
import { Worker } from '../typings/lib';
/**
 * Utility manager for a shard
 */
export declare class Shard extends EventEmitter<DiscordDefaultEventMap> {
    id: number;
    worker: Worker;
    /**
     * Ping in ms
     */
    ping: number;
    private ws;
    private unavailableGuilds;
    private registered;
    constructor(id: number, worker: Worker);
    /**
     * Current shard state
     */
    get state(): State;
    /**
     * Whether or not the shard is READY
     */
    get ready(): boolean;
    start(): void;
    private _ready;
    register(): Promise<{}>;
    restart(kill: boolean, code?: number, reason?: string): void;
    setPresence(presence: GatewayPresenceUpdateData): void;
    getGuildMembers(opts: GatewayRequestGuildMembersData): Promise<Collection<Snowflake, APIGuildMember>>;
}
