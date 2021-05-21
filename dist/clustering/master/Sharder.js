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
        var _a, _b, _c, _d;
        if (!this.buckets[bucket])
            return;
        let next = (_a = this.buckets[bucket]) === null || _a === void 0 ? void 0 : _a.shift();
        if (next === undefined) {
            await UtilityFunctions_1.wait(5100);
            next = (_b = this.buckets[bucket]) === null || _b === void 0 ? void 0 : _b.shift();
            if (next === undefined) {
                this.buckets[bucket] = null;
                return;
            }
        }
        (_c = this.master.shardToCluster(next)) === null || _c === void 0 ? void 0 : _c.tell('START_SHARD', { id: next });
        if ((_d = this.buckets[bucket]) === null || _d === void 0 ? void 0 : _d.length)
            await UtilityFunctions_1.wait(5100);
        return await this.loop(bucket);
    }
}
exports.Sharder = Sharder;
