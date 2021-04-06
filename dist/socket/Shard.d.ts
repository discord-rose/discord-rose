import Collection from '@discordjs/collection';
import { APIGuildMember, GatewayPresenceUpdateData, GatewayRequestGuildMembersData, Snowflake } from 'discord-api-types';
import { State } from '../clustering/ThreadComms';
import { Worker } from '../typings/lib';
/**
 * Utility manager for a shard
 */
export declare class Shard {
    id: number;
    worker: Worker;
    /**
     * Ping in ms
     * @type {number}
     */
    ping: number;
    private ws;
    private unavailableGuilds;
    private registered;
    constructor(id: number, worker: Worker);
    /**
     * Current shard state
     * @type {State} 0 = Disconnected, 1 = Connecting, 2 = Connected
     */
    get state(): State;
    /**
     * Whether or not the shard is READY
     * @type {boolean}
     */
    get ready(): boolean;
    start(): void;
    private _ready;
    register(): Promise<{}>;
    restart(kill: boolean, code?: number, reason?: string): void;
    setPresence(presence: GatewayPresenceUpdateData): void;
    getGuildMembers(opts: GatewayRequestGuildMembersData): Promise<Collection<Snowflake, APIGuildMember>>;
}
