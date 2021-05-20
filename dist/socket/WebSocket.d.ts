import { Shard } from './Shard';
import WebSocket from 'ws';
import { GatewaySendPayload } from 'discord-api-types';
import { DiscordDefaultEventMap } from '../typings/Discord';
import { EventEmitter } from '@jpbberry/typed-emitter';
/**
 * Structure in charge of managing Discord communcation over websocket
 */
export declare class DiscordSocket extends EventEmitter<Pick<DiscordDefaultEventMap, 'READY' | 'GUILD_CREATE'>> {
    private shard;
    private connectTimeout?;
    private sequence;
    private sessionID;
    private hbInterval;
    private waitingHeartbeat;
    private heartbeatRetention;
    ws: WebSocket | null;
    connected: boolean;
    resuming: boolean;
    dying: boolean;
    constructor(shard: Shard);
    spawn(): Promise<void>;
    _send(data: GatewaySendPayload): void;
    private _handleMessage;
    private _heartbeat;
    private close;
    kill(): void;
}
