import { SingleWorker } from './SingleWorker';
/**
 * Sharder in charge of handling shard spawn ratelimtis
 */
export declare class SingleSharder {
    worker: SingleWorker;
    buckets: Array<number[] | null>;
    constructor(worker: SingleWorker);
    register(id: number): void;
    loop(bucket: number): Promise<void>;
}
