import { APIChannel, OverwriteType, Permissions, RESTDeleteAPIChannelPermissionResult, RESTDeleteAPIChannelPinResult, RESTDeleteAPIChannelResult, RESTGetAPIChannelInvitesResult, RESTGetAPIChannelMessagesQuery, RESTGetAPIChannelMessagesResult, RESTGetAPIChannelPinsResult, RESTPatchAPIChannelJSONBody, RESTPatchAPIChannelResult, RESTPostAPIChannelInviteJSONBody, RESTPostAPIChannelInviteResult, RESTPostAPIChannelTypingResult, RESTPutAPIChannelPermissionJSONBody, RESTPutAPIChannelPermissionResult, RESTPutAPIChannelPinResult, Snowflake } from 'discord-api-types'
import { RestManager } from '../Manager'

/**
 * Channels resource
 */
export class ChannelsResource {
  constructor (private readonly rest: RestManager) {}

  /**
   * Gets a channel
   * @param {Snowflake} channelId ID of channel
   */
  async get (channelId: Snowflake): Promise<APIChannel> {
    return await this.rest.request('GET', `/channels/${channelId}`) as APIChannel
  }

  /**
   * Edits a channel
   * @param {Snowflake} channelId ID of channel
   * @param {*} patch Data to edit with
   */
  async edit (channelId: Snowflake, patch: RESTPatchAPIChannelJSONBody): Promise<RESTPatchAPIChannelResult> {
    return await this.rest.request('PATCH', `/channels/${channelId}`, {
      body: patch
    }) as RESTPatchAPIChannelResult
  }

  /**
   * Delete a channel
   * @param {Snowflake} channelId ID of channel
   */
  async delete (channelId: Snowflake): Promise<RESTDeleteAPIChannelResult> {
    return await this.rest.request('DELETE', `/channels/${channelId}`) as RESTDeleteAPIChannelResult
  }

  private async _setPermission (channelId: Snowflake, id: Snowflake, data: RESTPutAPIChannelPermissionJSONBody): Promise<RESTPutAPIChannelPermissionResult> {
    return await this.rest.request('PATCH', `/channels/${channelId}/permissions/${id}`, {
      body: data
    }) as RESTPutAPIChannelPermissionResult
  }

  /**
   * Sets permissions for a specific role
   * @param {Snowflake} channelId ID of channel
   * @param {Snowflake} roleId Role to set permissions for
   * @param {number} allow BitWise permissions to allow
   * @param {number} deny BitWise permissions to deny
   */
  async setRolePermission (channelId: Snowflake, roleId: Snowflake, allow?: Permissions, deny?: Permissions): Promise<RESTPutAPIChannelPermissionResult> {
    return await this._setPermission(channelId, roleId, {
      allow: allow as Permissions,
      deny: deny as Permissions,
      type: OverwriteType.Role
    })
  }

  /**
   * Sets permissions for a specific member
   * @param {Snowflake} channelId ID of channel
   * @param {Snowflake} memberId Member to set permissions for
   * @param {number} allow BitWise permissions to allow
   * @param {number} deny BitWise permissions to deny
   */
  async setMemberPermission (channelId: Snowflake, memberId: Snowflake, allow?: Permissions, deny?: Permissions): Promise<RESTPutAPIChannelPermissionResult> {
    return await this._setPermission(channelId, memberId, {
      allow: allow as Permissions,
      deny: deny as Permissions,
      type: OverwriteType.Member
    })
  }

  /**
   * Remove permissions for a certain overwrite
   * @param {Snowflake} channelId ID of channel
   * @param {Snowflake} overwriteId Member or Role ID
   */
  async deletePermission (channelId: Snowflake, overwriteId: Snowflake): Promise<RESTDeleteAPIChannelPermissionResult> {
    return await this.rest.request('DELETE', `/channels/${channelId}/permissions/${overwriteId}`) as RESTDeleteAPIChannelPermissionResult
  }

  /**
   * Gets invites in channel
   * @param {Snowflake} channelId ID of channel
   */
  async getInvites (channelId: Snowflake): Promise<RESTGetAPIChannelInvitesResult> {
    return await this.rest.request('GET', `/channels/${channelId}/invites`) as RESTGetAPIChannelInvitesResult
  }

  /**
   * Creates an invite for the channel
   * @param {Snowflake} channelId ID of channel
   * @param {*} invite Invite settings
   */
  async createInvite (channelId: Snowflake, invite: RESTPostAPIChannelInviteJSONBody = {}): Promise<RESTPostAPIChannelInviteResult> {
    return await this.rest.request('POST', `/channels/${channelId}/invites`, {
      body: invite
    })
  }

  /**
   * Gets pins in a channel
   * @param {Snowflake} channelId ID of channel
   */
  async getPins (channelId: Snowflake): Promise<RESTGetAPIChannelPinsResult> {
    return await this.rest.request('GET', `/channels/${channelId}/pins`)
  }

  /**
   * Pins a message
   * @param {Snowflake} channelId ID of channel
   * @param {Snowflake} messageId ID of message to pin
   */
  async addPin (channelId: Snowflake, messageId: Snowflake): Promise<RESTPutAPIChannelPinResult> {
    return this.rest.request('PUT', `/channels/${channelId}/pins/${messageId}`) as RESTPutAPIChannelPinResult
  }

  /**
   * Removes a pin
   * @param {Snowflake} channelId ID of channel
   * @param {Snowflake} messageId ID of message to unpin
   */
  async deletePin (channelId: Snowflake, messageId: Snowflake): Promise<RESTDeleteAPIChannelPinResult> {
    return this.rest.request('DELETE', `/channels/${channelId}/pins/${messageId}`) as RESTDeleteAPIChannelPinResult
  }

  /**
   * Starts typing in channel
   * @param {Snowflake} channelId ID of channel
   */
  async typing (channelId: Snowflake): Promise<RESTPostAPIChannelTypingResult> {
    return this.rest.request('POST', `/channels/${channelId}/typing`) as RESTPostAPIChannelTypingResult
  }

  /**
   * Gets message from a channel
   * @param {Snowflake} channelId ID of channel
   * @param {*} query Query for request
   */
  async getMessages (channelId: Snowflake, query: RESTGetAPIChannelMessagesQuery): Promise<RESTGetAPIChannelMessagesResult> {
    return await this.rest.request('GET', `/channels/${channelId}/messages`, {
      query: query
    })
  }
}
