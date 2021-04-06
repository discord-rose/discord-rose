import { APIChannel, Permissions, RESTDeleteAPIChannelPermissionResult, RESTDeleteAPIChannelPinResult, RESTDeleteAPIChannelResult, RESTGetAPIChannelInvitesResult, RESTGetAPIChannelMessagesQuery, RESTGetAPIChannelMessagesResult, RESTGetAPIChannelPinsResult, RESTPatchAPIChannelJSONBody, RESTPatchAPIChannelResult, RESTPostAPIChannelInviteJSONBody, RESTPostAPIChannelInviteResult, RESTPostAPIChannelTypingResult, RESTPutAPIChannelPermissionResult, RESTPutAPIChannelPinResult, Snowflake } from 'discord-api-types';
import { RestManager } from '../Manager';
/**
 * Channels resource
 */
export declare class ChannelsResource {
    private readonly rest;
    constructor(rest: RestManager);
    /**
     * Gets a channel
     * @param {Snowflake} channelId ID of channel
     */
    get(channelId: Snowflake): Promise<APIChannel>;
    /**
     * Edits a channel
     * @param {Snowflake} channelId ID of channel
     * @param {*} patch Data to edit with
     */
    edit(channelId: Snowflake, patch: RESTPatchAPIChannelJSONBody): Promise<RESTPatchAPIChannelResult>;
    /**
     * Delete a channel
     * @param {Snowflake} channelId ID of channel
     */
    delete(channelId: Snowflake): Promise<RESTDeleteAPIChannelResult>;
    private _setPermission;
    /**
     * Sets permissions for a specific role
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} roleId Role to set permissions for
     * @param {number} allow BitWise permissions to allow
     * @param {number} deny BitWise permissions to deny
     */
    setRolePermission(channelId: Snowflake, roleId: Snowflake, allow?: Permissions, deny?: Permissions): Promise<RESTPutAPIChannelPermissionResult>;
    /**
     * Sets permissions for a specific member
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} memberId Member to set permissions for
     * @param {number} allow BitWise permissions to allow
     * @param {number} deny BitWise permissions to deny
     */
    setMemberPermission(channelId: Snowflake, memberId: Snowflake, allow?: Permissions, deny?: Permissions): Promise<RESTPutAPIChannelPermissionResult>;
    /**
     * Remove permissions for a certain overwrite
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} overwriteId Member or Role ID
     */
    deletePermission(channelId: Snowflake, overwriteId: Snowflake): Promise<RESTDeleteAPIChannelPermissionResult>;
    /**
     * Gets invites in channel
     * @param {Snowflake} channelId ID of channel
     */
    getInvites(channelId: Snowflake): Promise<RESTGetAPIChannelInvitesResult>;
    /**
     * Creates an invite for the channel
     * @param {Snowflake} channelId ID of channel
     * @param {*} invite Invite settings
     */
    createInvite(channelId: Snowflake, invite?: RESTPostAPIChannelInviteJSONBody): Promise<RESTPostAPIChannelInviteResult>;
    /**
     * Gets pins in a channel
     * @param {Snowflake} channelId ID of channel
     */
    getPins(channelId: Snowflake): Promise<RESTGetAPIChannelPinsResult>;
    /**
     * Pins a message
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message to pin
     */
    addPin(channelId: Snowflake, messageId: Snowflake): Promise<RESTPutAPIChannelPinResult>;
    /**
     * Removes a pin
     * @param {Snowflake} channelId ID of channel
     * @param {Snowflake} messageId ID of message to unpin
     */
    deletePin(channelId: Snowflake, messageId: Snowflake): Promise<RESTDeleteAPIChannelPinResult>;
    /**
     * Starts typing in channel
     * @param {Snowflake} channelId ID of channel
     */
    typing(channelId: Snowflake): Promise<RESTPostAPIChannelTypingResult>;
    /**
     * Gets message from a channel
     * @param {Snowflake} channelId ID of channel
     * @param {*} query Query for request
     */
    getMessages(channelId: Snowflake, query: RESTGetAPIChannelMessagesQuery): Promise<RESTGetAPIChannelMessagesResult>;
}
