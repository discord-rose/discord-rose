import { Response } from 'node-fetch';
import { Cache } from '@jpbberry/cache';
import { Bucket } from './Bucket';
import { ChannelsResource } from './resources/Channels';
import { MessagesResource } from './resources/Messages';
import { GuildsResource } from './resources/Guilds';
import { MembersResource } from './resources/Members';
import { UsersResource } from './resources/Users';
import { MiscResource } from './resources/Misc';
import { WebhooksResource } from './resources/Webhooks';
/**
 * The base rest handler for all things Discord rest
 */
export declare class RestManager {
    private readonly token;
    buckets: Cache<string, Bucket>;
    global: Promise<true> | null;
    /**
     * Channel resource
     * @type {ChannelsResource}
     */
    channels: ChannelsResource;
    /**
     * Messages resource
     * @type {MessagesResource}
     */
    messages: MessagesResource;
    /**
     * Guilds resource
     * @type {GuildsResource}
     */
    guilds: GuildsResource;
    /**
     * Members resource
     * @type {MembersResource}
     */
    members: MembersResource;
    /**
     * Users resource
     * @type {UsersResource}
     */
    users: UsersResource;
    /**
     * Misc resource
     * @type {MiscResource}
     */
    misc: MiscResource;
    /**
     * Webhooks resource
     * @type {WebhooksResource}
     */
    webhooks: WebhooksResource;
    constructor(token: string);
    private _key;
    /**
     * Make a custom request
     * @param method Method
     * @param route Route, e.g "/users/123"
     * @param options Other options
     */
    request(method: Methods, route: string, options?: RequestOptions): Promise<any>;
    make(opts: Request): Promise<{
        res: Response;
        json: any;
    }>;
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
    reject: (reason?: any) => void;
}
export {};
