"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bucket = void 0;
const UtilityFunctions_1 = require("../utils/UtilityFunctions");
/**
 * In charge of handling rest RateLimits
 */
class Bucket {
    constructor(id, manager) {
        this.id = id;
        this.manager = manager;
        this.id = id;
        this.manager = manager;
        this.working = false;
        this.queue = [];
        this.remaining = -1;
        this.reset = -1;
    }
    _resetTimer() {
        this.manager.buckets._resetTimer(this.id);
    }
    add(req) {
        this.queue.push(req);
        if (!this.working || this.queue.length === 1)
            void this.run();
    }
    async run() {
        const req = this.queue.shift();
        if (!req) {
            this.working = false;
            return;
        }
        this.working = true;
        this._resetTimer();
        if (this.manager.global) {
            await this.manager.global;
        }
        else if (this.remaining <= 0 && Date.now() < this.reset) {
            await UtilityFunctions_1.wait(this.reset + 500 - Date.now());
        }
        const { res, json } = await this.manager.make(req);
        const date = new Date(res.headers.get('Date'));
        const retryAfter = Number(res.headers.get('Retry-After')) * 1000;
        const remaining = res.headers.get('X-RateLimit-Remaining');
        const reset = Number(res.headers.get('X-RateLimit-Reset'));
        this.remaining = remaining ? Number(remaining) : 1;
        this.reset = reset ? (new Date(reset * 1000).getTime() - (date.getTime() - Date.now())) : Date.now();
        if (res.headers.get('X-RateLimit-Global')) {
            this.manager.global = UtilityFunctions_1.wait(retryAfter);
            await this.manager.global;
            this.manager.global = null;
        }
        if (res.status === 429) {
            this.queue.unshift(req);
            await UtilityFunctions_1.wait(retryAfter);
        }
        else if (res.ok) {
            req.resolve(json);
        }
        else {
            json.status = res.status;
            req.resolve({ error: json });
        }
        void this.run(); // run next item
    }
}
exports.Bucket = Bucket;
