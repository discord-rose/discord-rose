"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sharder = void 0;
const UtilityFunctions_1 = require("../../utils/UtilityFunctions");
/**
 * Sharder in charge of handling shard spawn ratelimtis
 */
class Sharder {
    constructor(master) {
        this.master = master;
        this.buckets = [];
    }
    register(id) {
        var _a, _b, _c;
        const bucket = id % this.master.session.max_concurrency;
        let running = true;
        if (!this.buckets[bucket]) {
            running = false;
            this.buckets[bucket] = [];
        }
        if (!((_a = this.buckets[bucket]) === null || _a === void 0 ? void 0 : _a.includes(id))) {
            (_b = this.buckets[bucket]) === null || _b === void 0 ? void 0 : _b.push(id);
        }
        this.buckets[bucket] = (_c = this.buckets[bucket]) === null || _c === void 0 ? void 0 : _c.sort((a, b) => a - b);
        if (!running && this.master.spawned)
            void this.loop(bucket);
    }
    async loop(bucket) {
        var _a, _b;
        if (!this.buckets[bucket])
            return;
        const next = (_a = this.buckets[bucket]) === null || _a === void 0 ? void 0 : _a.shift();
        if (next === undefined) {
            this.buckets[bucket] = null;
            return;
        }
        await ((_b = this.master.shardToCluster(next)) === null || _b === void 0 ? void 0 : _b.sendCommand('START_SHARD', { id: next }).catch(() => {
            this.master.log(`Shard ${next} failed to startup in time. Continuing.`);
        }));
        await UtilityFunctions_1.wait(this.master.options.spawnTimeout);
        return await this.loop(bucket);
    }
}
exports.Sharder = Sharder;
