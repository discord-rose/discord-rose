/// <reference types="node" />
import { EventEmitter } from '@jpbberry/typed-emitter';
import { Worker, MessagePort } from 'worker_threads';
import { CompleteBotOptions } from './master/Master';
import { APIGuild, APIMessage, Snowflake } from 'discord-api-types';
import { MessageTypes } from '../rest/resources/Messages';
/**
 * State of a shard socket
 */
export declare enum State {
    DISCONNECTED = 0,
    CONNECTING = 1,
    CONNECTED = 2
}
/**
 * Stats for a shard
 */
export interface ShardStats {
    id: number;
    ping: number;
    state: State;
    guilds: number;
}
/**
 * Stats for a cluster
 */
export interface ClusterStats {
    cluster: {
        memory: number;
        uptime: number;
        id: string;
    };
    shards: ShardStats[];
}
export interface ThreadEvents {
    '*': {
        send: {
            event: keyof ThreadEvents;
            d: any;
        };
        receive: any;
    };
    START: {
        send: {
            shards: number[];
            options: CompleteBotOptions;
        };
        receive: {};
    };
    KILL: {
        send: null;
        receive: null;
    };
    REGISTER_SHARD: {
        send: {
            id: number;
        };
        receive: {};
    };
    START_SHARD: {
        send: {
            id: number;
        };
        receive: {
            err: boolean;
        };
    };
    SHARD_READY: {
        send: {
            id: number;
        };
        receive: null;
    };
    LOG: {
        send: string;
        receive: null;
    };
    DEBUG: {
        send: string;
        receive: null;
    };
    RESTART_CLUSTER: {
        send: {
            id: any;
        };
        receive: null;
    };
    RESTART_SHARD: {
        send: {
            id: number;
        };
        receive: null;
    };
    GET_GUILD: {
        send: {
            id: Snowflake;
        };
        receive: APIGuild;
    };
    EVAL: {
        send: string;
        receive: any;
    };
    BROADCAST_EVAL: {
        send: string;
        receive: any[];
    };
    MASTER_EVAL: {
        send: string;
        receive: any;
    };
    SEND_WEBHOOK: {
        send: {
            id: Snowflake;
            token: string;
            data: MessageTypes;
        };
        receive: APIMessage;
    };
    GET_STATS: {
        send: null;
        receive: ClusterStats;
    };
    STATS: {
        send: null;
        receive: ClusterStats[];
    };
    BEGIN: {
        send: null;
        receive: null;
    };
}
export declare type ResolveFunction<K extends keyof ThreadEvents> = ThreadEvents[K]['receive'] extends null ? null : (data: ThreadEvents[K]['receive'] | {
    error: string;
}) => void;
export declare type ThreadCommsEventEmitter = {
    [K in keyof ThreadEvents]: [data: ThreadEvents[K]['send'], resolve: ResolveFunction<K>];
};
/**
 * Middleman between all thread communications
 */
export declare class ThreadComms extends EventEmitter<ThreadCommsEventEmitter> {
    private comms?;
    private readonly commands;
    _emit<K extends keyof ThreadCommsEventEmitter>(event: K, data: ThreadCommsEventEmitter[K], resolve: ResolveFunction<K>): boolean;
    constructor();
    register(comms: Worker | MessagePort): void;
    private _send;
    /**
     * Sends a command to the master
     * @param event Event to send
     * @param data Data to send along
     * @returns Data back
     * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
     */
    sendCommand<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): Promise<ThreadEvents[K]['receive']>;
    private _respond;
    /**
     * Tells the master something
     * @param event Event to send
     * @param data Data to send
     * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
     */
    tell<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): void;
}
