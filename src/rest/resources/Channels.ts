import { APIChannel, OverwriteType, Permissions, RESTDeleteAPIChannelPermissionResult, RESTDeleteAPIChannelPinResult, RESTDeleteAPIChannelResult, RESTGetAPIChannelInvitesResult, RESTGetAPIChannelMessagesQuery, RESTGetAPIChannelMessagesResult, RESTGetAPIChannelPinsResult, RESTPatchAPIChannelJSONBody, RESTPatchAPIChannelResult, RESTPostAPIChannelInviteJSONBody, RESTPostAPIChannelInviteResult, RESTPostAPIChannelTypingResult, RESTPutAPIChannelPermissionJSONBody, RESTPutAPIChannelPermissionResult, RESTPutAPIChannelPinResult, Snowflake } from 'discord-api-types';
import { RestManager } from '../Manager'

export class ChannelsResource {
  constructor (private rest: RestManager) {}

  /**
   * Gets a channel
   * @param channelId ID of channel
   */
  get (channelId: Snowflake): Promise<APIChannel> {
    return this.rest.request('GET', `/channels/${channelId}`) as Promise<APIChannel>
  }

  /**
   * Edits a channel
   * @param channelId ID of channel
   * @param patch Data to edit with
   */
  edit (channelId: Snowflake, patch: RESTPatchAPIChannelJSONBody): Promise<RESTPatchAPIChannelResult> {
    return this.rest.request('PATCH', `/channels/${channelId}`, {
      body: patch
    }) as Promise<RESTPatchAPIChannelResult>
  }

  /**
   * Delete a channel
   * @param channelId ID of channel
   */
  delete (channelId: Snowflake): Promise<RESTDeleteAPIChannelResult> {
    return this.rest.request('DELETE', `/channels/${channelId}`) as Promise<RESTDeleteAPIChannelResult>
  }

  private _setPermission (channelId: Snowflake, id: Snowflake, data: RESTPutAPIChannelPermissionJSONBody): Promise<RESTPutAPIChannelPermissionResult> {
    return this.rest.request('PATCH', `/channels/${channelId}/permissions/${id}`, {
      body: data
    }) as Promise<RESTPutAPIChannelPermissionResult>
  }

  /**
   * Sets permissions for a specific role
   * @param channelId ID of channel
   * @param roleId Role to set permissions for
   * @param allow BitWise permissions to allow
   * @param deny BitWise permissions to deny
   */
  setRolePermission (channelId: Snowflake, roleId: Snowflake, allow?: Permissions, deny?: Permissions): Promise<RESTPutAPIChannelPermissionResult> {
    return this._setPermission(channelId, roleId, {
      allow,
      deny,
      type: OverwriteType.Role
    })
  }

  /**
   * Sets permissions for a specific member
   * @param channelId ID of channel
   * @param memberId Member to set permissions for
   * @param allow BitWise permissions to allow
   * @param deny BitWise permissions to deny
   */
  setMemberPermission (channelId: Snowflake, memberId: Snowflake, allow?: Permissions, deny?: Permissions): Promise<RESTPutAPIChannelPermissionResult> {
    return this._setPermission(channelId, memberId, {
      allow,
      deny,
      type: OverwriteType.Member
    })
  }

  /**
   * Remove permissions for a certain overwrite
   * @param channelId ID of channel
   * @param overwriteId Member or Role ID
   */
  deletePermission (channelId: Snowflake, overwriteId: Snowflake): Promise<RESTDeleteAPIChannelPermissionResult> {
    return this.rest.request('DELETE', `/channels/${channelId}/permissions/${overwriteId}`) as Promise<RESTDeleteAPIChannelPermissionResult >
  }

  /**
   * Gets invites in channel
   * @param channelId ID of channel
   */
  getInvites (channelId: Snowflake): Promise<RESTGetAPIChannelInvitesResult> {
    return this.rest.request('GET', `/channels/${channelId}/invites`) as Promise<RESTGetAPIChannelInvitesResult>
  }

  /**
   * Creates an invite for the channel
   * @param channelId ID of channel
   * @param invite Invite settings
   */
  createInvite (channelId: Snowflake, invite: RESTPostAPIChannelInviteJSONBody = {} ): Promise<RESTPostAPIChannelInviteResult> {
    return this.rest.request('POST', `/channels/${channelId}/invites`, {
      body: invite
    })
  }

  /**
   * Gets pins in a channel
   * @param channelId ID of channel
   */
  getPins (channelId: Snowflake): Promise<RESTGetAPIChannelPinsResult> {
    return this.rest.request('GET', `/channels/${channelId}/pins`)
  }

  /**
   * Pins a message
   * @param channelId ID of channel
   * @param message ID of message to pin
   */
  addPin (channelId: Snowflake, message: Snowflake): Promise<RESTPutAPIChannelPinResult> {
    return this.rest.request('PUT', `/channels/${channelId}/pins/${message}`) as RESTPutAPIChannelPinResult
  }

  /**
   * Removes a pin
   * @param channelId ID of channel
   * @param message ID of message to unpin
   */
  deletePin (channelId: Snowflake, message: Snowflake): Promise<RESTDeleteAPIChannelPinResult> {
    return this.rest.request('DELETE', `/channels/${channelId}/pins/${message}`) as RESTDeleteAPIChannelPinResult
  }

  /**
   * Starts typing in channel
   * @param channelId ID of channel
   */
  typing (channelId: Snowflake): Promise<RESTPostAPIChannelTypingResult> {
    return this.rest.request('POST', `/channels/${channelId}/typing`) as RESTPostAPIChannelTypingResult 
  }

  /**
   * Gets message from a channel
   * @param channelId ID of channel
   * @param query Query for request
   */
  getMessages (channelId: Snowflake, query: RESTGetAPIChannelMessagesQuery): Promise<RESTGetAPIChannelMessagesResult> {
    return this.rest.request(`GET`, `/channels/${channelId}/messages`, {
      query: query
    })
  }
}