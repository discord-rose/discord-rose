"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksResource = void 0;
const Messages_1 = require("./Messages");
/**
 * Webhook resource
 */
class WebhooksResource {
    constructor(rest) {
        this.rest = rest;
    }
    /**
     * Creates a new webhook on the channel
     * @param {Snowflake} channelID ID of channel
     * @param {*} data Data for new webhook
     */
    async create(channelID, data) {
        return await this.rest.request('POST', `/channels/${channelID}/webhooks`, {
            body: data
        });
    }
    /**
     * Get a webhook
     * @param {Snowflake} webhookId ID of webhook
     * @param {string} token Token of webhook
     */
    async get(webhookId, token) {
        return await this.rest.request('GET', `/webhooks/${webhookId}/${token}`);
    }
    /**
     * Sends a message via webhook
     * @param {Snowflake} webhookId ID of Webhook
     * @param {string} token Token of Webhook
     * @param {*} data Data for message
     */
    async send(webhookId, token, data) {
        return await this.rest.request('POST', `/webhooks/${webhookId}/${token}`, {
            query: {
                wait: 'true'
            },
            body: Messages_1.MessagesResource._formMessage(data, true)
        });
    }
    /**
     * Deletes a webhook
     * @param {Snowflake} webhookId ID of webhook
     * @param {string?} token Token (if none provided, uses bot permission)
     */
    async delete(webhookId, token) {
        return await this.rest.request('DELETE', `/webhooks/${webhookId}${token ? `/${token}` : ''}`);
    }
}
exports.WebhooksResource = WebhooksResource;
