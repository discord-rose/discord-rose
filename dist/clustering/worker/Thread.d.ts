import { APIGuild, APIMessage, Snowflake } from 'discord-api-types';
import { MessageTypes } from '../../rest/resources/Messages';
import { Worker } from '../../typings/lib';
import { ClusterStats, ThreadComms } from '../ThreadComms';
/**
 * Thread interface for interacting with the master process from a worker
 */
export declare class Thread extends ThreadComms {
    worker: Worker;
    id: string;
    constructor(worker?: Worker);
    registerShard(id: number): Promise<{}>;
    /**
     * Destroys entire master.
     */
    destroy(): void;
    /**
     * Logs data to master's MasterOptions.log
     * @param {string} message Message args
     */
    log(...messages: any[]): void;
    /**
     * Restarts a specific cluster
     * @param {string} clusterId ID of cluster
     */
    restartCluster(clusterId: string): Promise<null>;
    /**
     * Restarts a specific shard
     * @param {number} shardId ID of shard
     */
    restartShard(shardId: any): void;
    /**
     * Gets a cached guild across clusters
     * @param {Snowflake} guildId ID of guild
     * @returns {Promise<APIGuild>} The guild
     */
    getGuild(guildId: Snowflake): Promise<APIGuild>;
    /**
     * Eval code on every cluster
     * @param {string} code Code to eval
     * @returns {Promise<any[]>} Response
     */
    broadcastEval(code: string): Promise<any[]>;
    /**
     * Evals code on the master process
     * @param {string} code Code to eval
     * @returns {Promise<*>} Response
     */
    masterEval(code: string): Promise<any>;
    /**
     * Sends a webhook using the master process, useful for respecting ratelimits
     * @param {Snowflake} webhookId ID of webhook
     * @param {string} token Token of webhook
     * @param {MessageTypes} data Data for message
     * @returns {Promies<APIMessage>} Message sent
     */
    sendWebhook(webhookId: Snowflake, token: string, data: MessageTypes): Promise<APIMessage>;
    /**
     * Gets an array of each clusters stats
     * @returns {Promise<ClusterStats[]>} Stats
     */
    getStats(): Promise<ClusterStats[]>;
}
