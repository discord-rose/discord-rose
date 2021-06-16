"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shard = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
const typed_emitter_1 = require("@jpbberry/typed-emitter");
const ws_1 = require("ws");
const ThreadComms_1 = require("../clustering/ThreadComms");
const WebSocket_1 = require("./WebSocket");
/**
 * Utility manager for a shard
 */
class Shard extends typed_emitter_1.EventEmitter {
    constructor(id, worker) {
        super();
        this.id = id;
        this.worker = worker;
        /**
         * Ping in ms
         */
        this.ping = 0;
        this.ws = new WebSocket_1.DiscordSocket(this);
        this.unavailableGuilds = null;
        this.registered = false;
        this.on('READY', (data) => {
            if (!data)
                return;
            this.worker.comms.tell('SHARD_READY', { id });
            this.worker.user = data.user;
            this.unavailableGuilds = new collection_1.default();
            if (data.guilds.length < 1 || !this.worker.options.cache.guilds)
                return this._ready();
            data.guilds.forEach(guild => { var _a; return (_a = this.unavailableGuilds) === null || _a === void 0 ? void 0 : _a.set(guild.id, guild); });
        });
        let checkTimeout;
        this.on('GUILD_CREATE', (data) => {
            this.worker.cacheManager.emit('GUILD_CREATE', data);
            if (!this.unavailableGuilds)
                return this.worker.emit('GUILD_CREATE', data);
            if (!checkTimeout) {
                checkTimeout = setTimeout(() => {
                    if (!this.unavailableGuilds)
                        return;
                    if (this.unavailableGuilds.size)
                        this.worker.log(`Shard ${this.id} reported ${this.unavailableGuilds.size} unavailable guilds. Continuing startup.`);
                    this.unavailableGuilds.keyArray().forEach(id => {
                        this.worker.emit('GUILD_UNAVAILABLE', { id, unavailable: true });
                    });
                    this._ready();
                }, 15e3);
            }
            else
                checkTimeout.refresh();
            this.unavailableGuilds.delete(data.id);
            if (this.unavailableGuilds.size === 0) {
                clearTimeout(checkTimeout);
                this._ready();
            }
        });
        this.on('GUILD_DELETE', (guild) => {
            var _a, _b;
            if (guild.unavailable) {
                worker.emit('GUILD_UNAVAILABLE', worker.options.cache.guilds ? (_a = worker.guilds.get(guild.id)) !== null && _a !== void 0 ? _a : guild : guild);
            }
            if (((_b = this.unavailableGuilds) === null || _b === void 0 ? void 0 : _b.has(guild.id)) && !guild.unavailable) {
                this.unavailableGuilds.delete(guild.id);
            }
            else
                worker.emit('GUILD_DELETE', guild);
        });
    }
    /**
     * Current shard state
     */
    get state() {
        if (this.ready)
            return ThreadComms_1.State.CONNECTED;
        if (this.registered || this.unavailableGuilds)
            return ThreadComms_1.State.CONNECTING;
        return ThreadComms_1.State.DISCONNECTED;
    }
    /**
     * Whether or not the shard is READY
     */
    get ready() {
        var _a;
        return ((_a = this.ws.ws) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.OPEN && !this.unavailableGuilds;
    }
    start() {
        this.registered = false;
        void this.ws.spawn();
    }
    _ready() {
        this.worker.emit('SHARD_READY', this);
        this.unavailableGuilds = null;
        if (this.worker.shards.every(x => x.ready)) {
            this.worker.emit('READY', null);
        }
    }
    async register() {
        this.registered = true;
        return await this.worker.comms.registerShard(this.id);
    }
    restart(kill, code = 1012, reason = 'Manually Stopped') {
        if (kill)
            this.ws.kill();
        else {
            this.ws.resuming = true;
        }
        this.ws.close(code, reason);
    }
    setPresence(presence) {
        this.ws._send({
            op: 3 /* PresenceUpdate */,
            d: presence
        });
    }
    async getGuildMembers(opts) {
        return await new Promise(resolve => {
            const members = new collection_1.default();
            const listener = (data) => {
                var _a;
                if (data.guild_id !== opts.guild_id)
                    return;
                data.members.forEach((member) => {
                    if (!member.user)
                        return;
                    members.set(member.user.id, member);
                    member.guild_id = opts.guild_id;
                    this.worker.cacheManager.emit('GUILD_MEMBER_ADD', member);
                });
                if (data.chunk_index === ((_a = data.chunk_count) !== null && _a !== void 0 ? _a : 0) - 1) {
                    this.worker.off('GUILD_MEMBERS_CHUNK', listener);
                    resolve(members);
                }
            };
            this.worker.on('GUILD_MEMBERS_CHUNK', listener);
            this.ws._send({
                op: 8 /* RequestGuildMembers */,
                d: opts
            });
        });
    }
}
exports.Shard = Shard;
