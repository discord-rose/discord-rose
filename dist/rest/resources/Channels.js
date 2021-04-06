"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelsResource = void 0;
/**
 * Channels resource
 */
class ChannelsResource {
    constructor(rest) {
        this.rest = rest;
    }
    /**
     * Gets a channel
     * @param channelId ID of channel
     */
    async get(channelId) {
        return await this.rest.request('GET', `/channels/${channelId}`);
    }
    /**
     * Edits a channel
     * @param channelId ID of channel
     * @param patch Data to edit with
     */
    async edit(channelId, patch) {
        return await this.rest.request('PATCH', `/channels/${channelId}`, {
            body: patch
        });
    }
    /**
     * Delete a channel
     * @param channelId ID of channel
     */
    async delete(channelId) {
        return await this.rest.request('DELETE', `/channels/${channelId}`);
    }
    async _setPermission(channelId, id, data) {
        return await this.rest.request('PATCH', `/channels/${channelId}/permissions/${id}`, {
            body: data
        });
    }
    /**
     * Sets permissions for a specific role
     * @param channelId ID of channel
     * @param roleId Role to set permissions for
     * @param allow BitWise permissions to allow
     * @param deny BitWise permissions to deny
     */
    async setRolePermission(channelId, roleId, allow, deny) {
        return await this._setPermission(channelId, roleId, {
            allow: allow,
            deny: deny,
            type: 0 /* Role */
        });
    }
    /**
     * Sets permissions for a specific member
     * @param channelId ID of channel
     * @param memberId Member to set permissions for
     * @param allow BitWise permissions to allow
     * @param deny BitWise permissions to deny
     */
    async setMemberPermission(channelId, memberId, allow, deny) {
        return await this._setPermission(channelId, memberId, {
            allow: allow,
            deny: deny,
            type: 1 /* Member */
        });
    }
    /**
     * Remove permissions for a certain overwrite
     * @param channelId ID of channel
     * @param overwriteId Member or Role ID
     */
    async deletePermission(channelId, overwriteId) {
        return await this.rest.request('DELETE', `/channels/${channelId}/permissions/${overwriteId}`);
    }
    /**
     * Gets invites in channel
     * @param channelId ID of channel
     */
    async getInvites(channelId) {
        return await this.rest.request('GET', `/channels/${channelId}/invites`);
    }
    /**
     * Creates an invite for the channel
     * @param channelId ID of channel
     * @param invite Invite settings
     */
    async createInvite(channelId, invite = {}) {
        return await this.rest.request('POST', `/channels/${channelId}/invites`, {
            body: invite
        });
    }
    /**
     * Gets pins in a channel
     * @param channelId ID of channel
     */
    async getPins(channelId) {
        return await this.rest.request('GET', `/channels/${channelId}/pins`);
    }
    /**
     * Pins a message
     * @param channelId ID of channel
     * @param messageId ID of message to pin
     */
    async addPin(channelId, messageId) {
        return this.rest.request('PUT', `/channels/${channelId}/pins/${messageId}`);
    }
    /**
     * Removes a pin
     * @param channelId ID of channel
     * @param messageId ID of message to unpin
     */
    async deletePin(channelId, messageId) {
        return this.rest.request('DELETE', `/channels/${channelId}/pins/${messageId}`);
    }
    /**
     * Starts typing in channel
     * @param channelId ID of channel
     */
    async typing(channelId) {
        return this.rest.request('POST', `/channels/${channelId}/typing`);
    }
    /**
     * Gets message from a channel
     * @param channelId ID of channel
     * @param query Query for request
     */
    async getMessages(channelId, query) {
        return await this.rest.request('GET', `/channels/${channelId}/messages`, {
            query: query
        });
    }
}
exports.ChannelsResource = ChannelsResource;
