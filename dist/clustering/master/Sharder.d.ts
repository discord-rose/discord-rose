import { Master } from './Master';
/**
 * Sharder in charge of handling shard spawn ratelimtis
 */
export declare class Sharder {
    master: Master;
    buckets: Array<number[] | null>;
    constructor(master: Master);
    register(id: number): void;
    loop(bucket: number): Promise<void>;
}
