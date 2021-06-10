"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordSocket = void 0;
const ws_1 = __importDefault(require("ws"));
/**
 * Structure in charge of managing Discord communcation over websocket
 */
class DiscordSocket {
    constructor(shard) {
        this.shard = shard;
        this.sequence = null;
        this.sessionID = null;
        this.hbInterval = null;
        this.waitingHeartbeat = false;
        this.heartbeatRetention = 0;
        this.ws = null;
        this.connected = false;
        this.resuming = false;
        this.dying = false;
        this.selfClose = false;
    }
    close(code, reason) {
        var _a;
        this.shard.worker.log(`Shard ${this.shard.id} closing with ${code} & ${reason}`);
        this.selfClose = true;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close(code, reason);
    }
    async spawn() {
        var _a, _b, _c;
        if (this.ws && this.ws.readyState === ws_1.default.OPEN)
            this.close(1012, 'Starting again');
        this.ws = null;
        this.connected = false;
        this.heartbeatRetention = 0;
        this.waitingHeartbeat = false;
        this.dying = false;
        if (this.hbInterval)
            clearInterval(this.hbInterval);
        try {
            this.ws = new ws_1.default(this.shard.worker.options.ws + '?v=' + String((_b = (_a = this.shard.worker.options.rest) === null || _a === void 0 ? void 0 : _a.version) !== null && _b !== void 0 ? _b : 8));
        }
        catch (err) {
            if (this.connectTimeout)
                clearTimeout(this.connectTimeout);
            this.shard.restart(true, 1013);
        }
        this.connectTimeout = setTimeout(() => {
            if (!this.connected)
                return this.shard.restart(true, 1013, 'Didn\'t Connect in Time');
        }, 60e3);
        (_c = this.ws) === null || _c === void 0 ? void 0 : _c.on('message', (data) => this._handleMessage(data)).once('close', (code, reason) => this.onClose(code, reason));
    }
    _send(data) {
        var _a, _b, _c;
        if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) !== ((_b = this.ws) === null || _b === void 0 ? void 0 : _b.OPEN))
            return;
        (_c = this.ws) === null || _c === void 0 ? void 0 : _c.send(JSON.stringify(data));
    }
    _handleMessage(data) {
        var _a;
        const msg = JSON.parse(data.toString('utf-8'));
        if (msg.s)
            this.sequence = msg.s;
        if (msg.op === 0 /* Dispatch */) {
            if (["READY" /* Ready */, "RESUMED" /* Resumed */].includes(msg.t)) {
                if (msg.t === "RESUMED" /* Resumed */) {
                    this.shard.worker.log(`Shard ${this.shard.id} resumed at sequence ${(_a = this.sequence) !== null && _a !== void 0 ? _a : 0}`);
                }
                this.connected = true;
                this.resuming = false;
                clearTimeout(this.connectTimeout);
            }
            if (msg.t === "READY" /* Ready */)
                this.sessionID = msg.d.session_id;
            void this.shard.emit(msg.t, msg.d);
            this.shard.worker.emit('*', msg);
            if (msg.t === 'READY')
                return; // To satisfy typings
            this.shard.worker.emit(msg.t, msg.d);
        }
        else if (msg.op === 1 /* Heartbeat */) {
            this._heartbeat();
        }
        else if (msg.op === 7 /* Reconnect */) {
            this.shard.restart(false, 1012, 'Opcode 7 Restart');
        }
        else if (msg.op === 9 /* InvalidSession */) {
            setTimeout(() => {
                this.shard.restart(!msg.d, 1002, 'Invalid Session');
            }, Math.ceil(Math.random() * 5) * 1000);
        }
        else if (msg.op === 10 /* Hello */) {
            if (this.resuming && (!this.sessionID || !this.sequence)) {
                this.shard.worker.log('Cancelling resume because of missing session info');
                this.resuming = false;
            }
            if (this.resuming) {
                this._send({
                    op: 6 /* Resume */,
                    d: {
                        token: this.shard.worker.options.token,
                        session_id: this.sessionID,
                        seq: this.sequence
                    }
                });
            }
            else {
                this._send({
                    op: 2 /* Identify */,
                    d: {
                        shard: [this.shard.id, this.shard.worker.options.shards],
                        intents: this.shard.worker.options.intents,
                        token: this.shard.worker.options.token,
                        properties: {
                            $os: 'linux',
                            $browser: 'Discord-Rose',
                            $device: 'bot'
                        }
                    }
                });
            }
            this.hbInterval = setInterval(() => this._heartbeat(), msg.d.heartbeat_interval);
            this.waitingHeartbeat = false;
            this.heartbeatRetention = 0;
            this._heartbeat();
        }
        else if (msg.op === 11 /* HeartbeatAck */) {
            this.heartbeatRetention = 0;
            this.shard.ping = Date.now() - this.waitingHeartbeat;
            this.waitingHeartbeat = false;
            this.heartbeatRetention = 0;
        }
    }
    _heartbeat() {
        if (this.waitingHeartbeat) {
            this.heartbeatRetention++;
            if (this.heartbeatRetention > 5)
                return this.shard.restart(false, 1006, 'Not Receiving Heartbeats');
        }
        this._send({
            op: 1 /* Heartbeat */,
            d: this.sequence
        });
        this.waitingHeartbeat = Date.now();
    }
    onClose(code, reason) {
        if (this.selfClose) {
            this.selfClose = false;
        }
        else
            this.shard.worker.log(`Shard ${this.shard.id} closed with ${code} & ${reason || 'No Reason'}`);
        if (this.dying)
            void this.shard.register();
        else
            void this.spawn();
    }
    kill() {
        this.dying = true;
        this.resuming = false;
        this.sequence = null;
        this.sessionID = null;
    }
}
exports.DiscordSocket = DiscordSocket;
