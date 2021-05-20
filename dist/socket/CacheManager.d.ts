import { DiscordEventMap } from '../typings/Discord';
import { Worker } from '../clustering/worker/Worker';
import { EventEmitter } from '@jpbberry/typed-emitter';
/**
 * Utility for managing and ruling cache and it's subsequent control
 */
export declare class CacheManager extends EventEmitter<DiscordEventMap> {
    private readonly worker;
    constructor(worker: Worker);
}
