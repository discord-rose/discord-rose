import { Snowflake } from 'discord-api-types';
/**
 * Promisify a waiting time
 * @param time Time to wait
 */
export declare function wait(time: number): Promise<true>;
/**
 * Chunks shards into a 3D array
 * @param total Total amount of shards
 * @param perCluster Amount of shards per cluster
 */
export declare function chunkShards(total: number, perCluster: number): number[][];
/**
 * Generates command/response ID's for cluster workers
 * @param currently Current array of ID's (ensure's no duplicated)
 */
export declare function generateID(currently: string[]): string;
/**
 * Get the shard ID for a guild
 * @param id ID of guild
 * @param totalShards Total shards
 */
export declare function guildShard(id: Snowflake, totalShards: number): number;
export declare function resolveString(data: any): string;
