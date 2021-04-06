import { APIMessage, RESTGetAPIWebhookResult, RESTPostAPIChannelWebhookJSONBody, RESTPostAPIChannelWebhookResult, Snowflake } from 'discord-api-types';
import { RestManager } from '../Manager';
import { MessageTypes } from './Messages';
/**
 * Webhook resource
 */
export declare class WebhooksResource {
    private readonly rest;
    constructor(rest: RestManager);
    /**
     * Creates a new webhook on the channel
     * @param {Snowflake} channelID ID of channel
     * @param {*} data Data for new webhook
     */
    create(channelID: Snowflake, data: RESTPostAPIChannelWebhookJSONBody): Promise<RESTPostAPIChannelWebhookResult>;
    /**
     * Get a webhook
     * @param {Snowflake} webhookId ID of webhook
     * @param {string} token Token of webhook
     */
    get(webhookId: Snowflake, token: string): Promise<RESTGetAPIWebhookResult>;
    /**
     * Sends a message via webhook
     * @param {Snowflake} webhookId ID of Webhook
     * @param {string} token Token of Webhook
     * @param {*} data Data for message
     */
    send(webhookId: Snowflake, token: string, data: MessageTypes): Promise<APIMessage>;
    /**
     * Deletes a webhook
     * @param {Snowflake} webhookId ID of webhook
     * @param {string?} token Token (if none provided, uses bot permission)
     */
    delete(webhookId: Snowflake, token?: string): Promise<never>;
}
