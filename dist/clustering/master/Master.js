"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Master = void 0;
/* eslint-disable @typescript-eslint/consistent-type-assertions */
const Manager_1 = require("../../rest/Manager");
const UtilityFunctions_1 = require("../../utils/UtilityFunctions");
const collection_1 = __importDefault(require("@discordjs/collection"));
const Cluster_1 = require("./Cluster");
const Sharder_1 = require("./Sharder");
const handlers_1 = require("./handlers");
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const Emitter_1 = require("../../utils/Emitter");
const CachedChannelTypes = ['text', 'voice', 'category'];
/**
 * Master process controller
 */
class Master extends Emitter_1.Emitter {
    /**
     * Creates a new Master instance
     * @param fileName Location of Worker file
     * @param options Options
     */
    constructor(fileName, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
        super();
        /**
         * Rest Manager (only set after running .start())
         * @type {RestManager}
         */
        this.rest = {};
        /**
         * Handler emitter
         * @type {EventEmitter}
         * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
         */
        this.handlers = new events_1.EventEmitter();
        /**
         * Sharding manager for handling shard ratelimits
         * @type {Sharder}
         */
        this.sharder = new Sharder_1.Sharder(this);
        /**
         * Chunked Numbers for shards / cluster
         * @type {number[][]}
         */
        this.chunks = [[]];
        /**
         * Process list (including custom processes)
         * @type {Collection<string, Cluster>}
         */
        this.processes = new collection_1.default();
        /**
         * Whether or not the master has been spawned
         * @type {boolean}
         */
        this.spawned = false;
        this._clusterNames = [];
        this.longestName = 1;
        if (!fileName)
            throw new Error('Please provide the file name for the Worker');
        if (!options.token)
            throw new TypeError('Expected options.token');
        this.fileName = path_1.default.isAbsolute(fileName) ? fileName : path_1.default.resolve(process.cwd(), fileName);
        this.options = {
            token: options.token,
            shards: (_a = options.shards) !== null && _a !== void 0 ? _a : 'auto',
            shardsPerCluster: (_b = options.shardsPerCluster) !== null && _b !== void 0 ? _b : 5,
            shardOffset: (_c = options.shardOffset) !== null && _c !== void 0 ? _c : 0,
            cache: options.cache === false
                ? {
                    guilds: false,
                    roles: false,
                    channels: false,
                    self: false,
                    members: false,
                    messages: false,
                    users: false
                }
                : {
                    guilds: (_e = (_d = options.cache) === null || _d === void 0 ? void 0 : _d.guilds) !== null && _e !== void 0 ? _e : true,
                    roles: (_g = (_f = options.cache) === null || _f === void 0 ? void 0 : _f.roles) !== null && _g !== void 0 ? _g : true,
                    channels: (_j = (_h = options.cache) === null || _h === void 0 ? void 0 : _h.channels) !== null && _j !== void 0 ? _j : true,
                    self: (_l = (_k = options.cache) === null || _k === void 0 ? void 0 : _k.self) !== null && _l !== void 0 ? _l : true,
                    members: (_o = (_m = options.cache) === null || _m === void 0 ? void 0 : _m.members) !== null && _o !== void 0 ? _o : false,
                    messages: (_q = (_p = options.cache) === null || _p === void 0 ? void 0 : _p.messages) !== null && _q !== void 0 ? _q : false,
                    users: (_s = (_r = options.cache) === null || _r === void 0 ? void 0 : _r.users) !== null && _s !== void 0 ? _s : false
                },
            cacheControl: (_t = options.cacheControl) !== null && _t !== void 0 ? _t : {
                channels: false,
                guilds: false,
                members: false,
                roles: false
            },
            ws: (_u = options.ws) !== null && _u !== void 0 ? _u : '',
            intents: Array.isArray(options.intents)
                ? options.intents.reduce((a, b) => a | Intents[b], 0)
                : options.intents === true
                    ? Object.values(Intents).reduce((a, b) => a | b, 0)
                    : options.intents
                        ? options.intents
                        : Object.values(Intents).reduce((a, b) => a | b) & ~Intents.GUILD_MEMBERS & ~Intents.GUILD_PRESENCES,
            warnings: {
                cachedIntents: (_w = (_v = options.warnings) === null || _v === void 0 ? void 0 : _v.cachedIntents) !== null && _w !== void 0 ? _w : true
            },
            log: options.log
        };
        if (((_x = this.options.cache) === null || _x === void 0 ? void 0 : _x.channels) === true) {
            this.options.cache.channels = true;
        }
        else if (this.options.cache.channels) {
            const channelCaches = ((_y = this.options.cache) === null || _y === void 0 ? void 0 : _y.channels) === true ? CachedChannelTypes : (_z = this.options.cache.channels) !== null && _z !== void 0 ? _z : [];
            this.options.cache.channels = [];
            if (channelCaches.includes('text'))
                (_1 = (_0 = this.options.cache) === null || _0 === void 0 ? void 0 : _0.channels) === null || _1 === void 0 ? void 0 : _1.push(5 /* GUILD_NEWS */, 0 /* GUILD_TEXT */);
            if (channelCaches.includes('voice'))
                (_3 = (_2 = this.options.cache) === null || _2 === void 0 ? void 0 : _2.channels) === null || _3 === void 0 ? void 0 : _3.push(2 /* GUILD_VOICE */);
            if (channelCaches.includes('category'))
                (_5 = (_4 = this.options.cache) === null || _4 === void 0 ? void 0 : _4.channels) === null || _5 === void 0 ? void 0 : _5.push(4 /* GUILD_CATEGORY */);
        }
        this.log = typeof options.log === 'undefined'
            ? (msg, cluster) => {
                console.log(`${cluster ? `Cluster ${cluster.id}${' '.repeat(this.longestName - cluster.id.length)}` : `Master ${' '.repeat(this.longestName + 1)}`} | ${msg}`);
            }
            : options.log;
        if (!this.log)
            this.log = () => { };
        if ((_6 = this.options.warnings) === null || _6 === void 0 ? void 0 : _6.cachedIntents) {
            const warn = (key, intent) => console.warn(`WARNING: CacheOptions.${key} was turned on, but is missing the ${intent} intent. Meaning your cache with be empty. Either turn this on, or if it's intentional set Options.warnings.cachedIntents to false.`);
            if (((_7 = this.options.cache) === null || _7 === void 0 ? void 0 : _7.guilds) && ((this.options.intents & Intents.GUILDS) === 0))
                warn('guilds', 'GUILDS');
            if (((_8 = this.options.cache) === null || _8 === void 0 ? void 0 : _8.roles) && ((this.options.intents & Intents.GUILDS) === 0))
                warn('roles', 'GUILDS');
            if (((_9 = this.options.cache) === null || _9 === void 0 ? void 0 : _9.channels) && ((this.options.intents & Intents.GUILDS) === 0))
                warn('channels', 'GUILDS');
            if (((_10 = this.options.cache) === null || _10 === void 0 ? void 0 : _10.members) && ((this.options.intents & Intents.GUILD_MEMBERS) === 0))
                warn('members', 'GUILD_MEMBERS');
            if (((_11 = this.options.cache) === null || _11 === void 0 ? void 0 : _11.messages) && ((this.options.intents & Intents.GUILD_MESSAGES) === 0))
                warn('messages', 'GUILD_MESSAGES');
        }
        const keys = Object.keys(handlers_1.handlers);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.handlers.on(key, (shard, ...data) => { var _a; return (_a = handlers_1.handlers[key]) === null || _a === void 0 ? void 0 : _a.bind(shard)(...data); });
        }
    }
    /**
     * Get all Discord Bot clusters (discludes custom processes)
     * @type {Collection<string, Cluster>}
     */
    get clusters() {
        return this.processes.filter(x => !x.custom);
    }
    /**
     * Spawns a custom process
     * @param name Name of the process (especially for logging)
     * @param fileName Direct path for process
     * @returns The new Cluster thread created
     */
    spawnProcess(name, fileName) {
        if (this.processes.has(name))
            throw new Error(`Process ${name} is already spawned`);
        this._clusterNames.push(name);
        this.longestName = this._clusterNames.reduce((a, b) => a.length > b.length ? a : b, '').length;
        const cluster = new Cluster_1.Cluster(name, this, fileName, true);
        this.processes.set(name, cluster);
        cluster.spawn().catch(err => console.error(`Could not spawn ${name}: ${String(err)}`));
        return cluster;
    }
    /**
     * Starts the bot and spawns workers
     */
    async start() {
        var _a, _b, _c, _d;
        const timeStart = Date.now();
        this.rest = new Manager_1.RestManager(this.options.token);
        const gatewayRequest = await this.rest.misc.getGateway();
        this.session = gatewayRequest.session_start_limit;
        if (!this.options.ws)
            this.options.ws = gatewayRequest.url;
        if (this.options.shards === 'auto')
            this.options.shards = gatewayRequest.shards;
        if (typeof this.options.shards !== 'number')
            this.options.shards = 1;
        this.options.shards += (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.shardOffset) !== null && _b !== void 0 ? _b : 0;
        this.log(`Spawning ${this.options.shards} shards.`);
        this.chunks = UtilityFunctions_1.chunkShards(((_c = this.options) === null || _c === void 0 ? void 0 : _c.shards) || 1, (_d = this.options.shardsPerCluster) !== null && _d !== void 0 ? _d : 5);
        const promises = [];
        for (let i = 0; i < this.chunks.length; i++) {
            const cluster = new Cluster_1.Cluster(`${i}`, this);
            this.processes.set(`${i}`, cluster);
            this._clusterNames.push(`${i}`);
            this.longestName = this._clusterNames.reduce((a, b) => a.length > b.length ? a : b, '').length;
            promises.push(cluster.spawn());
        }
        await Promise.all(promises);
        this.log('Registering shards');
        await Promise.all(this.clusters.map(async (x) => await x.start()));
        this.log('Spawning');
        for (let i = 0; i < this.session.max_concurrency; i++) {
            void this.sharder.loop(i);
        }
        this.once('READY', () => {
            this.log(`Finished spawning after ${((Date.now() - timeStart) / 1000).toFixed(2)}s`);
            this.spawned = true;
        });
    }
    /**
     * Sends an event to all clusters
     * @param event Event name
     * @param data Event data
     * @param all Whether or not to send to all processes, including custom ones
     * @returns The data sent back
     */
    async sendToAll(event, data, all = false) {
        return await Promise.all(this[all ? 'processes' : 'clusters'].map(async (x) => await x.sendCommand(event, data)));
    }
    /**
     * Sends a TELL event to all clusters
     * @param event Event name
     * @param data Event data
     * @param all Whether or not to send to all processes, including custom ones
     * @returns Nothing
     */
    tellAll(event, data, all = false) {
        return this[all ? 'processes' : 'clusters'].map(x => x.tell(event, data));
    }
    /**
     * Evals code on every cluster
     * @param code Code to eval
     * @returns An array of responses
     */
    async broadcastEval(code) {
        return await this.sendToAll('EVAL', code);
    }
    /**
     * Gets each clusters stats
     * @returns Stats
     */
    async getStats() {
        return await this.sendToAll('GET_STATS', null);
    }
    /**
     * Convert a shard ID into it's containing cluster
     * @param shardId Shard ID to convert to
     * @returns The cluster the shard belongs to
     */
    shardToCluster(shardId) {
        for (let i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].includes(shardId))
                return this.clusters.get(`${i}`);
        }
        throw new Error('Doesn\'t have a cluster');
    }
    /**
     * Get the shard that has a certain guild
     * @param guildId ID of guild
     * @returns ID of shard
     */
    guildToShard(guildId) {
        return UtilityFunctions_1.guildShard(guildId, this.options.shards);
    }
    /**
     * Get a cluster based on the guild that should be cached there
     * @param guildId Guild ID
     * @returns Cluster guild belongs to
     */
    guildToCluster(guildId) {
        return this.shardToCluster(this.guildToShard(guildId));
    }
}
exports.Master = Master;
const Intents = {
    GUILDS: 1 << 0,
    GUILD_MEMBERS: 1 << 1,
    GUILD_BANS: 1 << 2,
    GUILD_EMOJIS: 1 << 3,
    GUILD_INTEGRATIONS: 1 << 4,
    GUILD_WEBHOOKS: 1 << 5,
    GUILD_INVITES: 1 << 6,
    GUILD_VOICE_STATES: 1 << 7,
    GUILD_PRESENCES: 1 << 8,
    GUILD_MESSAGES: 1 << 9,
    GUILD_MESSAGE_REACTIONS: 1 << 10,
    GUILD_MESSAGE_TYPING: 1 << 11,
    DIRECT_MESSAGES: 1 << 12,
    DIRECT_MESSAGE_REACTIONS: 1 << 13,
    DIRECT_MESSAGE_TYPING: 1 << 14
};
