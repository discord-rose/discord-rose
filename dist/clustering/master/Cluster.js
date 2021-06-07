"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cluster = void 0;
const worker_threads_1 = require("worker_threads");
const ThreadComms_1 = require("../ThreadComms");
/**
 * Cluster utility for working with the thread from the master process
 */
class Cluster extends ThreadComms_1.ThreadComms {
    constructor(id, master, fileName = master.fileName, custom = false) {
        super();
        this.id = id;
        this.master = master;
        this.fileName = fileName;
        this.custom = custom;
        /**
         * Whether or not the Cluster is currently online
         */
        this.started = false;
        /**
         * Whether or not the cluster has been spawned before
         */
        this.spawned = false;
        /**
         * Whether or not the Cluster shouldn't restart
         */
        this.dying = false;
        this.on('*', (data, respond) => {
            this.master.handlers.emit(data.event, this, data.d, respond);
        });
    }
    async spawn() {
        if (this.custom) {
            this.started = true;
        }
        return void new Promise(resolve => {
            this.thread = new worker_threads_1.Worker(this.fileName, {
                workerData: {
                    id: this.id,
                    custom: this.custom
                }
            });
            super.register(this.thread);
            this.thread.on('exit', (code) => {
                this.started = false;
                this.logAs(`Closed with code ${code}`);
                this.master.emit('CLUSTER_STOPPED', this);
                if (!this.dying)
                    void this.spawn();
            });
            this.thread.on('error', (error) => {
                console.error(error);
            });
            this.thread.on('online', () => {
                if (this.spawned)
                    void this.start();
                this.spawned = true;
                this.logAs('Started');
                this.master.emit('CLUSTER_STARTED', this);
                resolve(true);
            });
        });
    }
    async start() {
        if (this.custom)
            return;
        this.started = true;
        return await this.sendCommand('START', {
            shards: this.master.chunks[Number(this.id)],
            options: JSON.parse(JSON.stringify(this.master.options)) // normalize options
        });
    }
    logAs(msg) {
        this.master.log(msg, this);
    }
    /**
     * Restarts the cluster
     */
    restart() {
        this.dying = false;
        this.tell('KILL', null);
    }
    /**
     * Kills cluster without restarting
     */
    kill() {
        this.dying = true;
        this.tell('KILL', null);
    }
    /**
     * Restarts a shard
     * @param id ID of shard to restart
     */
    restartShard(id) {
        this.tell('RESTART_SHARD', { id });
    }
    /**
     * Gets a guild from the clusters cache
     * @param id ID of guild
     */
    async getGuild(id) {
        return await this.sendCommand('GET_GUILD', { id });
    }
    /**
     * Evals code on the cluster
     * @param code Code to eval
     */
    async eval(code) {
        return await this.sendCommand('EVAL', code);
    }
}
exports.Cluster = Cluster;
