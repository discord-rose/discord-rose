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
     * @param channelId ID of channel
     * @param data Data for new webhook
     */
    create(channelId: Snowflake, data: RESTPostAPIChannelWebhookJSONBody): Promise<RESTPostAPIChannelWebhookResult>;
    /**
     * Get a webhook
     * @param webhookId ID of webhook
     * @param token Token of webhook
     */
    get(webhookId: Snowflake, token: string): Promise<RESTGetAPIWebhookResult>;
    /**
     * Sends a message via webhook
     * @param webhookId ID of Webhook
     * @param token Token of Webhook
     * @param data Data for message
     */
    send(webhookId: Snowflake, token: string, data: MessageTypes): Promise<APIMessage>;
    /**
     * Deletes a webhook
     * @param webhookId ID of webhook
     * @param token Token (if none provided, uses bot permission)
     */
    delete(webhookId: Snowflake, token?: string): Promise<never>;
    /**
     * Edits a message sent by a webhook with it's token
     * @param webhookId ID of Webhook
     * @param token Token of Webhook
     * @param messageId ID of message
     * @param data Message data to replace
     * @returns New message
     */
    editMessage(webhookId: Snowflake, token: string, messageId: Snowflake | '@original', data: MessageTypes): Promise<APIMessage>;
    /**
     * Deletes a message sent by a webhook with it's token
     * @param webhookId ID of Webhook
     * @param token Token of Webhook
     * @param messageId ID of message
     */
    deleteMessage(webhookId: Snowflake, token: string, messageId: Snowflake): Promise<null>;
}
