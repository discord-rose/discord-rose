"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleSharder = void 0;
const UtilityFunctions_1 = require("../../../utils/UtilityFunctions");
/**
 * Sharder in charge of handling shard spawn ratelimtis
 */
class SingleSharder {
    constructor(worker) {
        this.worker = worker;
        this.buckets = [];
    }
    register(id) {
        var _a, _b, _c;
        const bucket = id % 1;
        let running = true;
        if (!this.buckets[bucket]) {
            running = false;
            this.buckets[bucket] = [];
        }
        if (!((_a = this.buckets[bucket]) === null || _a === void 0 ? void 0 : _a.includes(id))) {
            (_b = this.buckets[bucket]) === null || _b === void 0 ? void 0 : _b.push(id);
        }
        this.buckets[bucket] = (_c = this.buckets[bucket]) === null || _c === void 0 ? void 0 : _c.sort((a, b) => a - b);
        if (!running)
            void this.loop(bucket);
    }
    async loop(bucket) {
        var _a;
        this.worker.debug(`Looping bucket #${bucket}`);
        if (!this.buckets[bucket])
            return;
        const next = (_a = this.buckets[bucket]) === null || _a === void 0 ? void 0 : _a.shift();
        if (next === undefined) {
            this.buckets[bucket] = null;
            this.worker.debug(`Reached end of bucket #${bucket}`);
            return;
        }
        const nextShard = this.worker.shards.get(next);
        if (nextShard) {
            nextShard.start();
            await this.worker._waitForShard(nextShard);
        }
        await UtilityFunctions_1.wait(this.worker.options.spawnTimeout);
        return await this.loop(bucket);
    }
}
exports.SingleSharder = SingleSharder;
