import { Shard } from './Shard';
import WebSocket from 'ws';
import { Emitter } from '../utils/Emitter';
import { GatewaySendPayload } from 'discord-api-types';
import { DiscordDefaultEventMap } from '../typings/Discord';
/**
 * Structure in charge of managing Discord communcation over websocket
 */
export declare class DiscordSocket extends Emitter<Pick<DiscordDefaultEventMap, 'READY' | 'GUILD_CREATE'>> {
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
