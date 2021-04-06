"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesResource = void 0;
const Embed_1 = require("../../structures/Embed");
const form_data_1 = __importDefault(require("form-data"));
/**
 * Message resource
 */
class MessagesResource {
    constructor(rest) {
        this.rest = rest;
    }
    static _formMessage(message, webhook) {
        if (message instanceof Embed_1.Embed) {
            message = webhook
                ? {
                    embeds: [message.render()]
                }
                : {
                    embed: message.render()
                };
        }
        if (typeof message === 'string') {
            message = {
                content: message
            };
        }
        return message;
    }
    /**
     * Sends a message to a channel
     * @param {Snowflake} channelId ID of channel
     * @param {*} data Message data
     */
    async send(channelId, data, reply) {
        const msg = MessagesResource._formMessage(data);
        if (reply)
            msg.message_reference = reply;
        return await this.rest.request('POST', `/channels/${channelId}/messages`, {
            body: msg
        });
    }
    /**
     * Sends a file to a channel
     * @param {Snowflake} channelId ID of channel
     * @param {*} data File Buffer and name
     * @param {*} extra Extra message data
     */
    async sendFile(channelId, data, extra) {
        const formData = new form_data_1.default();
        formData.append('file', data.buffer, data.name || 'file');
        if (extra)
            formData.append('payload_json', JSON.stringify(MessagesResource._formMessage(extra)));
        return await this.rest.request('POST', `/channels/${channelId}/messages`, {
            body: formData,
            headers: formData.getHeaders(),
            parser: (_) => _
        });
    }
    /**
     * Gets a message
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message
     */
    async get(channelId, messageId) {
        return await this.rest.request('GET', `/channels/${channelId}/messages/${messageId}`);
    }
    /**
     * Deletes a message
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message
     */
    async delete(channelId, messageId) {
        return this.rest.request('DELETE', `/channels/${channelId}/messages/${messageId}`);
    }
    /**
     * Deletes multiple messages
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake[]} messageIds ID of messages
     */
    async bulkDelete(channelId, messageIds) {
        if (messageIds.length < 2)
            return await this.delete(channelId, messageIds[0]);
        return this.rest.request('POST', `/channels/${channelId}/messages/bulk-delete`, {
            body: {
                messages: messageIds
            }
        });
    }
    /**
     * Edits a message
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message
     * @param {*} data New message data
     */
    async edit(channelId, messageId, data) {
        return await this.rest.request('PATCH', `/channels/${channelId}/messages/${messageId}`, {
            body: MessagesResource._formMessage(data)
        });
    }
    /**
     * Publishes a message in a news channel
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message
     */
    async crosspost(channelId, messageId) {
        return await this.rest.request('POST', `/channels/${channelId}/messages/${messageId}/crosspost`);
    }
    _parseEmoji(emoji) {
        if (emoji.match(/^[0-9]+$/))
            return `<:unknown:${emoji}>`;
        return encodeURIComponent(emoji);
    }
    /**
     * Gets users who've reacted with a specific emoji
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message
     * @param {Snowflake|string} emoji ID or unicode for emoji
     * @param {*} query Query for fetching
     */
    async getReactions(channelId, messageId, emoji, query) {
        return await this.rest.request('GET', `/channels/${channelId}/messages/${messageId}/reactions/${this._parseEmoji(emoji)}`, {
            query
        });
    }
    /**
     * Adds a reaction to a message
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message
     * @param {Snowflake|string} emoji ID or unicode for emoji
     */
    async react(channelId, messageId, emoji) {
        return this.rest.request('PUT', `/channels/${channelId}/messages/${messageId}/reactions/${this._parseEmoji(emoji)}/@me`);
    }
    /**
     * Removes one reaction for a specific user
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message
     * @param {Snowflake|string} emoji ID or unicode for emoji
     * @param {Snowflake} user Users or leave blank to remove your own
     */
    async deleteReaction(channelId, messageId, emoji, user = '@me') {
        return this.rest.request('DELETE', `/channels/${channelId}/messages/${messageId}/reactions/${this._parseEmoji(emoji)}/${user}`);
    }
    /**
     * Deletes multiple reactions from a message
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message
     * @param {Snowflake|string|null} emoji Emoji ID or unicode, or leave blank to remove all reactions
     */
    async deleteAllReactions(channelId, messageId, emoji) {
        return this.rest.request('DELETE', `/channels/${channelId}/messages/${messageId}/reactions${emoji ? `/${this._parseEmoji(emoji)}` : ''}`);
    }
}
exports.MessagesResource = MessagesResource;
