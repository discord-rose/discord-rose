"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmojisResource = void 0;
/**
 * Emojis resource
 */
class EmojisResource {
    constructor(rest) {
        this.rest = rest;
    }
    /**
     * Get a single emoji from a guild
     * @param guildId ID of the emoji's guild
     * @param emojiId The ID of the emoji
     */
    async get(guildId, emojiId) {
        return await this.rest.request('GET', `/guilds/${guildId}/emojis/${emojiId}`);
    }
    /**
     * Get all emojis from a guild
     * @param guildId ID of the emoji's guild
     */
    async getMany(guildId) {
        return await this.rest.request('GET', `/guilds/${guildId}/emojis`);
    }
    /**
     * Create an emoji
     * @param guildId ID of the guild to create the emoji in
     * @param data Emoji data
     */
    async create(guildId, data) {
        return await this.rest.request('POST', `/guilds/${guildId}/emojis`, {
            body: data
        });
    }
    /**
     * Edit an emoji
     * @param guildId ID of the emoji's guild
     * @param emojiId The ID of the emoji
     * @param data Data to edit with
     */
    async edit(guildId, emojiId, data) {
        return await this.rest.request('PATCH', `/guilds/${guildId}/emojis/${emojiId}`, {
            body: data
        });
    }
    /**
     * Delete an emoji
     * @param guildId ID of the emoji's guild
     * @param emojiId The ID of the emoji
     */
    async delete(guildId, emojiId) {
        return await this.rest.request('DELETE', `/guilds/${guildId}/emojis/${emojiId}`);
    }
}
exports.EmojisResource = EmojisResource;
