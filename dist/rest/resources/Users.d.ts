import { APIMessage, RESTGetAPIUserResult, RESTPostAPICurrentUserCreateDMChannelResult, Snowflake } from 'discord-api-types';
import { Cache } from '@jpbberry/cache';
import { RestManager } from '../Manager';
import { MessageTypes } from './Messages';
/**
 * Users resource
 */
export declare class UsersResource {
    private readonly rest;
    dmCache: Cache<Snowflake, RESTPostAPICurrentUserCreateDMChannelResult>;
    constructor(rest: RestManager);
    /**
     * Get user
     * @param userId User ID or defaults to own user
     */
    get(userId?: Snowflake | '@me'): Promise<RESTGetAPIUserResult>;
    /**
     * Creates a DM channel
     * @param userId ID of user
     */
    createDM(userId: Snowflake): Promise<RESTPostAPICurrentUserCreateDMChannelResult>;
    /**
     * Send a DM to user (create's DM channel for you)
     * @param userId ID of user
     * @param message Message data
     */
    dm(userId: Snowflake, message: MessageTypes): Promise<APIMessage>;
}
