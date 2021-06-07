import { Master } from './Master';
import { ThreadComms } from '../ThreadComms';
import { APIGuild, Snowflake } from 'discord-api-types';
/**
 * Cluster utility for working with the thread from the master process
 */
export declare class Cluster extends ThreadComms {
    id: string;
    master: Master;
    fileName: string;
    custom: boolean;
    private thread?;
    /**
     * Whether or not the Cluster is currently online
     */
    started: boolean;
    /**
     * Whether or not the cluster has been spawned before
     */
    spawned: boolean;
    /**
     * Whether or not the Cluster shouldn't restart
     */
    dying: boolean;
    constructor(id: string, master: Master, fileName?: string, custom?: boolean);
    spawn(): Promise<void>;
    start(): Promise<{} | undefined>;
    logAs(msg: string): void;
    /**
     * Restarts the cluster
     */
    restart(): void;
    /**
     * Kills cluster without restarting
     */
    kill(): void;
    /**
     * Restarts a shard
     * @param id ID of shard to restart
     */
    restartShard(id: number): void;
    /**
     * Gets a guild from the clusters cache
     * @param id ID of guild
     */
    getGuild(id: Snowflake): Promise<APIGuild>;
    /**
     * Evals code on the cluster
     * @param code Code to eval
     */
    eval(code: string): Promise<any[]>;
}
