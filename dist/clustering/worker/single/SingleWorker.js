"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleWorker = void 0;
const CacheManager_1 = require("../../../socket/CacheManager");
const Worker_1 = require("../Worker");
const formatBotOptions_1 = require("../../../utils/formatBotOptions");
const Manager_1 = require("../../../rest/Manager");
const Shard_1 = require("../../../socket/Shard");
const SingleSharder_1 = require("./SingleSharder");
const SingleThread_1 = require("./SingleThread");
class SingleWorker extends Worker_1.Worker {
    constructor(options) {
        super(false);
        this.sharder = new SingleSharder_1.SingleSharder(this);
        this.comms = new SingleThread_1.SingleThread(this);
        this.options = formatBotOptions_1.formatBotOptions(options);
        this.cacheManager = new CacheManager_1.CacheManager(this);
        this.api = new Manager_1.RestManager(this.options.token);
        const timeStart = Date.now();
        this.once('READY', () => {
            this.log(`Finished spawning after ${((Date.now() - timeStart) / 1000).toFixed(2)}s`);
        });
        this.log = typeof options.log === 'undefined'
            ? (msg, _cluster) => {
                console.log(`Singleton | ${msg}`);
            }
            : options.log;
        if (!this.log)
            this.log = () => { };
        void this._beginSingleton();
    }
    async _beginSingleton() {
        const gatewayRequest = await this.api.misc.getGateway();
        this.options.ws = gatewayRequest.url;
        if (this.options.shards === 'auto') {
            this.options.shards = gatewayRequest.shards;
        }
        void this.start();
    }
    async _waitForShard(shard) {
        return await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error());
            }, 15e3);
            shard.once('READY', () => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }
    async start() {
        this.log(`Connecting ${this.options.shards} shard${this.options.shards > 1 ? 's' : ''}`);
        for (let i = 0; i < this.options.shards; i++) {
            const shard = new Shard_1.Shard(i, this);
            this.shards.set(i, shard);
            await shard.register();
        }
    }
    debug(msg) {
        this.emit('DEBUG', msg);
    }
}
exports.SingleWorker = SingleWorker;
