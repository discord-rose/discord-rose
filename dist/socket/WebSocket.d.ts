import { Shard } from './Shard';
import WebSocket from 'ws';
import { GatewaySendPayload } from 'discord-api-types';
/**
 * Structure in charge of managing Discord communcation over websocket
 */
export declare class DiscordSocket {
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
    selfClose: boolean;
    private op7;
    constructor(shard: Shard);
    close(code: number, reason: string, report?: boolean): void;
    spawn(): Promise<void>;
    _send(data: GatewaySendPayload): void;
    private _handleMessage;
    private _sendIdentify;
    private _heartbeat;
    private onClose;
    kill(): void;
}
