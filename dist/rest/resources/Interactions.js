"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionResource = void 0;
const form_data_1 = __importDefault(require("form-data"));
const Messages_1 = require("./Messages");
/**
 * Interactions resource
 */
class InteractionResource {
    constructor(rest) {
        this.rest = rest;
    }
    /**
     * Sets all commands for an application, clearing previous
     * @param data An array of interaction data
     * @param applicationId Application/client ID
     * @param guildId Optional guild ID to only set commands for specific guild
     */
    async set(data, applicationId, guildId) {
        return await this.rest.request('PUT', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands`, {
            body: data
        });
    }
    /**
     * Gets all posted commands for an application
     * @param applicationId Application/client ID
     * @param guildId Optional guild ID to only get commands from a specific guild
     */
    async get(applicationId, guildId) {
        return await this.rest.request('GET', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands`);
    }
    /**
     * Adds a command for an application
     * @param data Interaction data
     * @param applicationId Application/client ID
     * @param guildId Optional guild ID to only add a command for a specific guild
     */
    async add(data, applicationId, guildId) {
        return await this.rest.request('POST', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands`, {
            body: data
        });
    }
    /**
     * Deletes a specific command for an application
     * @param interactionId Interaction ID
     * @param applicationId Application/client ID
     * @param guildId Optional guild ID to only delete a command for a specific guild
     */
    async delete(interactionId, applicationId, guildId) {
        await this.rest.request('DELETE', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}/commands/${interactionId}`);
    }
    /**
     * Updates/upserts a specific command
     * @param data Interaction data
     * @param applicationId Application/client ID
     * @param interactionId Interaction ID
     * @param guildId Optional guild ID to only update a command for a specific guild
     */
    async update(data, applicationId, interactionId, guildId) {
        return await this.rest.request('PATCH', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands/${interactionId}`, {
            body: data
        });
    }
    /**
     * Responds to an interaction
     * @param interactionId Interaction ID
     * @param interactionToken Interaction Token
     * @param data Interaction Callback Data
     */
    async callback(interactionId, interactionToken, data) {
        if (data.type === 4 /* ChannelMessageWithSource */) {
            if (data.data)
                data.data = Messages_1.MessagesResource._formMessage(data.data, true);
        }
        return await this.rest.request('POST', `/interactions/${interactionId}/${interactionToken}/callback`, {
            body: data
        });
    }
    /**
     * Sends a file to a channel
     * @param channelId ID of channel
     * @param data File Buffer and name
     * @param extra Extra message data
     */
    async callbackFile(interactionId, interactionToken, data, extra) {
        const formData = new form_data_1.default();
        formData.append('file', data.buffer, data.name || 'file');
        if (extra)
            formData.append('payload_json', JSON.stringify(Messages_1.MessagesResource._formMessage(extra)));
        return await this.rest.request('POST', `/interactions/${interactionId}/${interactionToken}/callback`, {
            body: formData,
            headers: formData.getHeaders(),
            parser: (_) => _
        });
    }
}
exports.InteractionResource = InteractionResource;
