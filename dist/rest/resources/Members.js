"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersResource = void 0;
/**
 * Members resource
 */
class MembersResource {
    constructor(rest) {
        this.rest = rest;
    }
    /**
     * Gets a member
     * @param guildId ID of guild
     * @param roleId ID of member
     */
    async get(guildId, memberId) {
        return await this.rest.request('GET', `/guilds/${guildId}/members/${memberId}`);
    }
    /**
     * Gets a list of members
     * @param guild ID of guild
     * @param query Query for search
     */
    async getMany(guildId, query) {
        return await this.rest.request('GET', `/guilds/${guildId}/members`, {
            query
        });
    }
    /**
     * Edits a member
     * @param guildId ID of guild
     * @param memberId ID of member
     * @param data New data for member
     */
    // eslint-disable-next-line @typescript-eslint/default-param-last
    async edit(guildId, memberId = '@me', data) {
        return await this.rest.request('PATCH', `/guilds/${guildId}/members/${memberId}`, {
            body: data
        });
    }
    /**
     * Sets a members nickname
     * @param guildId ID of guild
     * @param id ID of member (or leave blank for self)
     * @param nick New nickname (null to reset)
     */
    async setNickname(guildId, memberId = '@me', nick) {
        if (memberId !== '@me')
            return await this.edit(guildId, memberId, { nick });
        return await this.rest.request('PATCH', `/guilds/${guildId}/members/${memberId}/nick`, {
            body: {
                nick
            }
        });
    }
    /**
     * Adds a role to member
     * @param guildId ID of guild
     * @param memberId ID of member
     * @param roleId ID of role to add
     */
    async addRole(guildId, memberId, roleId) {
        return this.rest.request('PUT', `/guilds/${guildId}/members/${memberId}/roles/${roleId}`);
    }
    /**
     * Removes a role from the member
     * @param guildId ID of guild
     * @param memberId ID of member
     * @param roleId ID of role
     */
    async removeRole(guildId, memberId, roleId) {
        return this.rest.request('DELETE', `/guilds/${guildId}/members/${memberId}/roles/${roleId}`);
    }
    /**
     * Kicks a member
     * @param guildId ID of guild
     * @param memberId ID of member
     * @param reason Reason for kick
     */
    async kick(guildId, memberId, reason) {
        return this.rest.request('DELETE', `/guilds/${guildId}/members/${memberId}`, {
            reason
        });
    }
    /**
     * Bans a member
     * @param guildId ID of guild
     * @param memberId ID of member
     * @param extra Extra, reason for ban and since days of messages to remove
     */
    async ban(guildId, memberId, extra) {
        return this.rest.request('PUT', `/guilds/${guildId}/bans/${memberId}`, {
            body: extra
        });
    }
    /**
     * Unbans a member
     * @param guildId ID of guild
     * @param memberId ID of member
     */
    async unban(guildId, memberId) {
        return this.rest.request('DELETE', `/guilds/${guildId}/bans/${memberId}`);
    }
}
exports.MembersResource = MembersResource;
