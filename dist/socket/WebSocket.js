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
        this.sequence = 1;
        this.sessionID = 'null';
        this.hbInterval = null;
        this.waitingHeartbeat = false;
        this.heartbeatRetention = 0;
        this.ws = null;
        this.connected = false;
        this.resuming = true;
        this.dying = false;
        this.selfClose = false;
        this.op7 = false;
    }
    close(code, reason, report = true) {
        var _a;
        if (!this.op7)
            this.shard.worker.log(`Shard ${this.shard.id} closing with ${code} & ${reason}`);
        if (report)
            this.selfClose = true;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close(code, reason);
    }
    async spawn() {
        var _a, _b, _c;
        this.shard.worker.debug(`Shard ${this.shard.id} is spawning`);
        if (this.ws && this.ws.readyState === ws_1.default.OPEN)
            this.close(1012, 'Starting again', false);
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
        (_c = this.ws) === null || _c === void 0 ? void 0 : _c.on('message', (data) => this._handleMessage(data)).once('close', (code, reason) => this.onClose(code, reason)).on('error', (err) => this.shard.worker.debug(`Received WS error on shard ${this.shard.id}: ${err.name} / ${err.message}`));
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
                    if (this.op7) {
                        this.op7 = false;
                    }
                    else
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
            if (["READY" /* Ready */, "GUILD_CREATE" /* GuildCreate */, "GUILD_DELETE" /* GuildDelete */].includes(msg.t))
                return;
            this.shard.worker.emit(msg.t, msg.d);
        }
        else if (msg.op === 1 /* Heartbeat */) {
            this._heartbeat();
        }
        else if (msg.op === 7 /* Reconnect */) {
            this.op7 = true;
            this.shard.restart(false, 1012, 'Opcode 7 Restart');
        }
        else if (msg.op === 9 /* InvalidSession */) {
            setTimeout(() => {
                if (!this.resuming)
                    this.shard.restart(!msg.d, 1002, 'Invalid Session');
                else {
                    this.shard.worker.debug(`Shard ${this.shard.id} could not resume, sending a fresh identify`);
                    this.resuming = false;
                    this._sendIdentify();
                }
            }, Math.ceil(Math.random() * 5) * 1000);
        }
        else if (msg.op === 10 /* Hello */) {
            if (this.resuming && (!this.sessionID || !this.sequence)) {
                this.shard.worker.debug('Cancelling resume because of missing session info');
                this.resuming = false;
                this.sequence = null;
                this.sessionID = null;
            }
            this.shard.worker.debug(`Received HELLO on shard ${this.shard.id}. ${this.resuming ? '' : 'Not '}Resuming. (Heartbeat @ 1/${msg.d.heartbeat_interval / 1000}s)`);
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
                this._sendIdentify();
            }
            this.hbInterval = setInterval(() => this._heartbeat(), msg.d.heartbeat_interval);
            this.waitingHeartbeat = false;
            this.heartbeatRetention = 0;
            this._heartbeat();
        }
        else if (msg.op === 11 /* HeartbeatAck */) {
            this.shard.worker.debug(`Heartbeat acknowledged on shard ${this.shard.id}`);
            this.heartbeatRetention = 0;
            this.shard.ping = Date.now() - this.waitingHeartbeat;
            this.waitingHeartbeat = false;
            this.heartbeatRetention = 0;
        }
    }
    _sendIdentify() {
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
    _heartbeat() {
        var _a;
        this.shard.worker.debug(`Heartbeat @ ${(_a = this.sequence) !== null && _a !== void 0 ? _a : 'none'}. Retention at ${this.heartbeatRetention} on shard ${this.shard.id}`);
        if (this.waitingHeartbeat) {
            this.heartbeatRetention++;
            if (this.heartbeatRetention > 5)
                return this.shard.restart(false, 1012, 'Not Receiving Heartbeats');
        }
        this._send({
            op: 1 /* Heartbeat */,
            d: this.sequence
        });
        this.waitingHeartbeat = Date.now();
    }
    onClose(code, reason) {
        this.shard.emit('CLOSED', code, reason);
        if (this.selfClose) {
            this.shard.worker.debug(`Self closed with code ${code}`);
            this.selfClose = false;
        }
        else
            this.shard.worker.log(`Shard ${this.shard.id} closed with ${code} & ${reason || 'No Reason'}`);
        if (code === 1006)
            this.resuming = true;
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
