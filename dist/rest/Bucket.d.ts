import { RestManager, Request } from './Manager';
/**
 * In charge of handling rest RateLimits
 */
export declare class Bucket {
    id: string;
    private manager;
    working: Boolean;
    remaining: number;
    reset: number;
    private readonly queue;
    constructor(id: string, manager: RestManager);
    _resetTimer(): void;
    add(req: Request): void;
    run(): Promise<void>;
}
