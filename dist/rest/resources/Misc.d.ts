import { APIGatewayBotInfo } from 'discord-api-types';
import { RestManager } from '../Manager';
/**
 * Miscellanious resource
 */
export declare class MiscResource {
    private readonly rest;
    constructor(rest: RestManager);
    /**
     * Get gateway endpoint
     */
    getGateway(): Promise<APIGatewayBotInfo>;
}
