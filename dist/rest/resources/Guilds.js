"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildsResource = void 0;
/**
 * Guilds resource
 */
class GuildsResource {
    constructor(rest) {
        this.rest = rest;
    }
    /**
     * Gets a guild
     * @param guildId ID of guild
     * @param withCount Whether or not to add approximation counts
     */
    async get(guildId, withCount = false) {
        return await this.rest.request('GET', `/guilds/${guildId}`, {
            query: {
                with_counts: withCount
            }
        });
    }
    /**
     * Edit a guild
     * @param guildId ID of guild
     * @param data Data to edit with
     */
    async edit(guildId, data) {
        return await this.rest.request('PATCH', `/guilds/${guildId}`, {
            body: data
        });
    }
    /**
     * Leaves a guild
     * @param guildId ID of guild
     */
    async leave(guildId) {
        return this.rest.request('DELETE', `/users/@me/guilds/${guildId}`);
    }
    /**
     * Gets a list of guilds
     * @param guildId ID of guild
     */
    async getRoles(guildId) {
        return await this.rest.request('GET', `/guilds/${guildId}/roles`);
    }
    /**
     * Creates a new role
     * @param guildId ID of guild
     * @param data Data for new role
     */
    async createRole(guildId, data) {
        return await this.rest.request('POST', `/guilds/${guildId}/roles`, {
            body: data
        });
    }
    /**
     * Edits an existing role
     * @param guildId ID of guild
     * @param roleId ID of role
     * @param data New data for role
     */
    async editRole(guildId, roleId, data) {
        return await this.rest.request('PATCH', `/guilds/${guildId}/roles/${roleId}`, {
            body: data
        });
    }
    /**
     * Deletes a role
     * @param guildId ID of guild
     * @param roleId ID of role
     */
    async deleteRole(guildId, roleId) {
        return this.rest.request('DELETE', `/guilds/${guildId}/roles/${roleId}`);
    }
}
exports.GuildsResource = GuildsResource;
