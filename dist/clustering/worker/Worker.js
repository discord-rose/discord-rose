"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const Thread_1 = require("./Thread");
const collection_1 = __importDefault(require("@discordjs/collection"));
const Shard_1 = require("../../socket/Shard");
const CacheManager_1 = require("../../socket/CacheManager");
const UtilityFunctions_1 = require("../../utils/UtilityFunctions");
const CommandHandler_1 = require("../../structures/CommandHandler");
const Manager_1 = require("../../rest/Manager");
const typed_emitter_1 = require("@jpbberry/typed-emitter");
/**
 * Cluster Worker used on the worker thread
 */
class Worker extends typed_emitter_1.EventEmitter {
    constructor() {
        super(...arguments);
        /**
         * Bot options
         */
        this.options = {};
        /**
         * All shards on this cluster
         */
        this.shards = new collection_1.default();
        /**
         * Rest manager
         */
        this.api = {};
        /**
         * Command handler
         */
        this.commands = new CommandHandler_1.CommandHandler(this);
        /**
         * Thread communications
         */
        this.comms = new Thread_1.Thread(this);
        /**
         * Cached guilds
         */
        this.guilds = new collection_1.default();
        /**
         * Cached roles
         */
        this.guildRoles = new collection_1.default();
        /**
         * Cached channels
         */
        this.channels = new collection_1.default();
        /**
         * Cached self members
         */
        this.selfMember = new collection_1.default();
        /**
         * Cached members
         */
        this.members = new collection_1.default();
        /**
         * Cached users
         */
        this.users = new collection_1.default();
        /**
         * Cached voice states
         */
        this.voiceStates = new collection_1.default();
        /**
         * Self user
         */
        this.user = {};
        this.cacheManager = {};
    }
    async start(shardNumbers) {
        this.api = new Manager_1.RestManager(this.options.token);
        this.cacheManager = new CacheManager_1.CacheManager(this);
        for (let i = 0; i < shardNumbers.length; i++) {
            const shard = new Shard_1.Shard(shardNumbers[i], this);
            this.shards.set(shardNumbers[i], shard);
            await shard.register();
        }
    }
    /**
     * Sets the status of the client
     * @param type Type of status, e.g "playing" is "Playing Game!"
     * @param name Name of status, in this case Game
     * @param status Status type
     * @param url Optional url for twitch stream
     * @example
     * worker.setStatus('playing', 'Rocket League', 'online') // Playing Rocket League
     * // Twitch streams
     * worker.setStatus('streaming', 'Rocket League', 'online', 'https://twitch.com/jpbberry')
     */
    setStatus(type, name, status = 'online', url) {
        if (!this.ready)
            return void this.once('READY', () => { this.setStatus(type, name, status); });
        this.shards.forEach(shard => {
            shard.setPresence({
                afk: false,
                since: Date.now(),
                status: status,
                activities: [
                    {
                        name,
                        type: ({
                            playing: 0 /* Game */,
                            streaming: 1 /* Streaming */,
                            listening: 2 /* Listening */,
                            watching: 3 /* Watching */,
                            competing: 5 /* Competing */
                        })[type],
                        url
                    }
                ]
            });
        });
    }
    /**
     * Gets shard in charge of specific guild
     * @param guildId ID of guild
     */
    guildShard(guildId) {
        const shard = this.shards.get(UtilityFunctions_1.guildShard(guildId, this.options.shards));
        if (!shard)
            throw new Error('Guild not on this cluster.');
        return shard;
    }
    /**
     * Gets ALL members in a guild (via ws)
     * @param guildId ID of guild
     */
    async getMembers(guildId) {
        return await this.guildShard(guildId).getGuildMembers({
            guild_id: guildId,
            query: '',
            limit: 0
        });
    }
    /**
     * Whether or not all shards are online and ready
     */
    get ready() {
        return this.api instanceof Manager_1.RestManager && this.shards.every(x => x.ready);
    }
    /**
     * Log something to master
     * @param data What to log
     */
    log(...data) {
        this.comms.log(...data);
    }
    /**
     * Debug
     * @internal
     * @param msg Debug message
     */
    debug(msg) {
        this.comms.tell('DEBUG', msg);
    }
}
exports.Worker = Worker;
