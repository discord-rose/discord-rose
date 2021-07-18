"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intents = exports.Master = void 0;
/* eslint-disable @typescript-eslint/consistent-type-assertions */
const Manager_1 = require("../../rest/Manager");
const UtilityFunctions_1 = require("../../utils/UtilityFunctions");
const collection_1 = __importDefault(require("@discordjs/collection"));
const Cluster_1 = require("./Cluster");
const Sharder_1 = require("./Sharder");
const handlers_1 = require("./handlers");
const path_1 = __importDefault(require("path"));
const typed_emitter_1 = require("@jpbberry/typed-emitter");
const formatBotOptions_1 = require("../../utils/formatBotOptions");
/**
 * Master process controller
 */
class Master extends typed_emitter_1.EventEmitter {
    /**
     * Creates a new Master instance
     * @param fileName Location of Worker file
     * @param options Options
     */
    constructor(fileName, options) {
        super();
        /**
         * Rest Manager (only set after running .start())
         */
        this.rest = {};
        /**
         * Handler emitter
         * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
         */
        this.handlers = new typed_emitter_1.EventEmitter();
        /**
         * Sharding manager for handling shard ratelimits
         */
        this.sharder = new Sharder_1.Sharder(this);
        /**
         * Chunked Numbers for shards / cluster
         */
        this.chunks = [[]];
        /**
         * Process list (including custom processes)
         */
        this.processes = new collection_1.default();
        /**
         * Whether or not the master has been spawned
         */
        this.spawned = false;
        this._clusterNames = [];
        this.longestName = 1;
        if (!fileName)
            throw new Error('Please provide the file name for the Worker');
        if (!options.token)
            throw new TypeError('Expected options.token');
        this.fileName = path_1.default.isAbsolute(fileName) ? fileName : path_1.default.resolve(process.cwd(), fileName);
        this.options = formatBotOptions_1.formatBotOptions(options);
        this.log = typeof options.log === 'undefined'
            ? (msg, cluster) => {
                console.log(`${cluster ? `Cluster ${cluster.id}${' '.repeat(this.longestName - cluster.id.length)}` : `Master ${' '.repeat(this.longestName + 1)}`} | ${msg}`);
            }
            : options.log;
        if (!this.log)
            this.log = () => { };
        const keys = Object.keys(handlers_1.handlers);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.handlers.on(key, (shard, ...data) => { var _a; return (_a = handlers_1.handlers[key]) === null || _a === void 0 ? void 0 : _a.bind(shard)(...data); });
        }
    }
    debug(msg) {
        this.emit('DEBUG', msg);
    }
    /**
     * Get all Discord Bot clusters (discludes custom processes)
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
        this.debug(`Start gateway: ${JSON.stringify(gatewayRequest)}`);
        this.session = gatewayRequest.session_start_limit;
        if (!this.options.ws)
            this.options.ws = gatewayRequest.url;
        if (this.options.shards === 'auto')
            this.options.shards = gatewayRequest.shards;
        if (typeof this.options.shards !== 'number')
            this.options.shards = 1;
        this.options.shards += (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.shardOffset) !== null && _b !== void 0 ? _b : 0;
        this.chunks = UtilityFunctions_1.chunkShards(((_c = this.options) === null || _c === void 0 ? void 0 : _c.shards) || 1, (_d = this.options.shardsPerCluster) !== null && _d !== void 0 ? _d : 5);
        this.log(`Creating ${this.options.shards} shard${this.options.shards > 1 ? 's' : ''} / ${this.chunks.length} cluster${this.chunks.length > 1 ? 's' : ''}`);
        const promises = [];
        for (let i = 0; i < this.chunks.length; i++) {
            const cluster = new Cluster_1.Cluster(`${i}`, this);
            this.processes.set(`${i}`, cluster);
            this._clusterNames.push(`${i}`);
            this.longestName = this._clusterNames.reduce((a, b) => a.length > b.length ? a : b, '').length;
            promises.push(cluster.spawn());
        }
        await Promise.all(promises);
        this.debug('All clusters have been spawned, registering shards');
        await Promise.all(this.clusters.map(async (x) => await x.start()));
        this.debug('Shards have been registered, starting loop');
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
exports.Intents = {
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
