"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thread = void 0;
const worker_threads_1 = require("worker_threads");
const Messages_1 = require("../../rest/resources/Messages");
const ThreadComms_1 = require("../ThreadComms");
const util_1 = require("util");
const handlers_1 = require("./handlers");
/**
 * Thread interface for interacting with the master process from a worker
 */
class Thread extends ThreadComms_1.ThreadComms {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    constructor(worker = {}) {
        super();
        this.worker = worker;
        this.id = worker_threads_1.workerData.id;
        super.register(worker_threads_1.parentPort);
        const keys = Object.keys(handlers_1.handlers);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.on(key, (data, resolve) => {
                var _a;
                (_a = handlers_1.handlers[key]) === null || _a === void 0 ? void 0 : _a.bind(this)(data, resolve);
            });
        }
    }
    async registerShard(id) {
        return await this.sendCommand('REGISTER_SHARD', { id });
    }
    /**
     * Destroys entire master.
     */
    destroy() {
        void this.sendCommand('KILL', null);
    }
    /**
     * Logs data to master's MasterOptions.log
     * @param message Message args
     */
    log(...messages) {
        this.tell('LOG', messages.map(m => typeof m === 'string' ? m : util_1.inspect(m)).join(' '));
    }
    /**
     * Restarts a specific cluster
     * @param clusterId ID of cluster
     */
    async restartCluster(clusterId) {
        return await this.sendCommand('RESTART_CLUSTER', { id: clusterId });
    }
    /**
     * Restarts a specific shard
     * @param shardId ID of shard
     */
    restartShard(shardId) {
        return this.tell('RESTART_SHARD', { id: shardId });
    }
    /**
     * Gets a cached guild across clusters
     * @param guildId ID of guild
     * @returns The guild
     */
    async getGuild(guildId) {
        return await this.sendCommand('GET_GUILD', { id: guildId });
    }
    /**
     * Eval code on every cluster
     * @param code Code to eval
     * @returns Response
     */
    async broadcastEval(code) {
        return await this.sendCommand('BROADCAST_EVAL', code);
    }
    /**
     * Evals code on the master process
     * @param code Code to eval
     * @returns Response
     */
    async masterEval(code) {
        return await this.sendCommand('MASTER_EVAL', code);
    }
    /**
     * Sends a webhook using the master process, useful for respecting ratelimits
     * @param webhookId ID of webhook
     * @param token Token of webhook
     * @param data Data for message
     * @returns Message sent
     */
    async sendWebhook(webhookId, token, data) {
        return await this.sendCommand('SEND_WEBHOOK', { id: webhookId, token, data: Messages_1.MessagesResource._formMessage(data, true) });
    }
    /**
     * Gets an array of each clusters stats
     * @returns Stats
     */
    async getStats() {
        return await this.sendCommand('STATS', null);
    }
}
exports.Thread = Thread;
