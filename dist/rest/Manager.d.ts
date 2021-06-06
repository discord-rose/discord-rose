import { Response } from 'node-fetch';
import { Cache } from '@jpbberry/cache';
import { Bucket } from './Bucket';
import { ChannelsResource } from './resources/Channels';
import { EmojisResource } from './resources/Emojis';
import { MessagesResource } from './resources/Messages';
import { GuildsResource } from './resources/Guilds';
import { InteractionResource } from './resources/Interactions';
import { MembersResource } from './resources/Members';
import { UsersResource } from './resources/Users';
import { MiscResource } from './resources/Misc';
import { WebhooksResource } from './resources/Webhooks';
export interface RestManagerOptions {
    /**
     * The API version number. Be careful as this can cause unexpected behavior.
     * @default 8
     */
    version?: number;
}
/**
 * The base rest handler for all things Discord rest
 */
export declare class RestManager {
    private readonly token;
    buckets: Cache<string, Bucket>;
    global: Promise<true> | null;
    /**
     * Channel resource
     */
    channels: ChannelsResource;
    /**
     * Emojis resource
     */
    emojis: EmojisResource;
    /**
     * Messages resource
     */
    messages: MessagesResource;
    /**
     * Guilds resource
     */
    guilds: GuildsResource;
    /**
     * Interactions resource
     */
    interactions: InteractionResource;
    /**
     * Members resource
     */
    members: MembersResource;
    /**
     * Users resource
     */
    users: UsersResource;
    /**
     * Misc resource
     */
    misc: MiscResource;
    /**
     * Webhooks resource
     */
    webhooks: WebhooksResource;
    options: RestManagerOptions;
    constructor(token: string, options?: RestManagerOptions);
    private _key;
    /**
     * Make a custom request
     * @param method Method
     * @param route Route, e.g "/users/123"
     * @param options Other options
     */
    request(method: Methods, route: string, options?: RequestOptions): Promise<any>;
    /**
     * @internal
     */
    make(opts: Request): Promise<{
        res: Response;
        json: any;
    } | never>;
}
declare type Methods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
/**
 * Request options
 */
interface RequestOptions {
    headers?: {
        [key: string]: string;
    };
    query?: any;
    body?: any;
    reason?: string;
    parser?: (data: any) => string;
}
export interface Request {
    method: Methods;
    route: string;
    options: RequestOptions;
    resolve: (value?: any) => void;
}
export {};
