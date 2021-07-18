"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleWorker = void 0;
const CacheManager_1 = require("../../../socket/CacheManager");
const Worker_1 = require("../Worker");
const formatBotOptions_1 = require("../../../utils/formatBotOptions");
const Manager_1 = require("../../../rest/Manager");
const Shard_1 = require("../../../socket/Shard");
const SingleSharder_1 = require("./SingleSharder");
class SingleWorker extends Worker_1.Worker {
    constructor(options) {
        super(false);
        this.sharder = new SingleSharder_1.SingleSharder(this);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.comms = {
            id: '0',
            tell: (event, data) => {
                if (event === 'LOG')
                    this.log(data);
                if (event === 'SHARD_READY')
                    this.log(`Shard ${data.id} connected to Discord`);
            },
            registerShard: (id) => {
                this.sharder.register(id);
            }
        };
        this.options = formatBotOptions_1.formatBotOptions(options);
        this.cacheManager = new CacheManager_1.CacheManager(this);
        this.api = new Manager_1.RestManager(this.options.token);
        this.once('READY', () => {
            this.log('All shards ready');
        });
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
        return await new Promise((resolve) => {
            shard.once('READY', () => resolve());
        });
    }
    async start() {
        for (let i = 0; i < this.options.shards; i++) {
            const shard = new Shard_1.Shard(i, this);
            this.shards.set(i, shard);
            await shard.register();
        }
    }
    log(msg) {
        console.log(msg);
    }
    debug(msg) { }
}
exports.SingleWorker = SingleWorker;
