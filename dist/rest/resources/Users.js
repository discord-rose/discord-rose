"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersResource = void 0;
const cache_1 = require("@jpbberry/cache");
/**
 * Users resource
 */
class UsersResource {
    constructor(rest) {
        this.rest = rest;
        this.dmCache = new cache_1.Cache(60e3);
    }
    /**
     * Get user
     * @param {Snowflake} userId User ID or defaults to own user
     */
    async get(userId = '@me') {
        return await this.rest.request('GET', `/users/${userId}`);
    }
    /**
     * Creates a DM channel
     * @param {Snowflake} userId ID of user
     */
    async createDM(userId) {
        if (this.dmCache.has(userId))
            return this.dmCache.get(userId);
        const channel = await this.rest.request('POST', '/users/@me/channels', {
            body: {
                recipient_id: userId
            }
        });
        this.dmCache.set(userId, channel);
        return channel;
    }
    /**
     * Send a DM to user (create's DM channel for you)
     * @param {Snowflake} userId ID of user
     * @param {*} message Message data
     */
    async dm(userId, message) {
        const channel = await this.createDM(userId);
        return await this.rest.messages.send(channel.id, message);
    }
}
exports.UsersResource = UsersResource;
