import { DiscordEventMap } from '../typings/Discord';
import { Worker } from '../clustering/worker/Worker';
import { Emitter } from '../utils/Emitter';
/**
 * Utility for managing and ruling cache and it's subsequent control
 */
export declare class CacheManager extends Emitter<DiscordEventMap> {
    private readonly worker;
    constructor(worker: Worker);
}
