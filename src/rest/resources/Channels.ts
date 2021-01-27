import { APIChannel, OverwriteType, Permissions, RESTDeleteAPIChannelPermissionResult, RESTDeleteAPIChannelPinResult, RESTDeleteAPIChannelResult, RESTGetAPIChannelInvitesResult, RESTGetAPIChannelPinsResult, RESTPatchAPIChannelJSONBody, RESTPatchAPIChannelResult, RESTPostAPIChannelInviteJSONBody, RESTPostAPIChannelInviteResult, RESTPostAPIChannelTypingResult, RESTPutAPIChannelPermissionJSONBody, RESTPutAPIChannelPermissionResult, RESTPutAPIChannelPinResult, Snowflake } from 'discord-api-types';
import { RestManager } from '../Manager'

export class ChannelsResource {
  constructor (private rest: RestManager) {}

  /**
   * Gets a channel
   * @param id ID of channel
   */
  get (id: Snowflake): APIChannel {
    return this.rest.request('GET', `/channels/${id}`) as unknown as APIChannel
  }

  /**
   * Edits a channel
   * @param id ID of channel
   * @param patch Data to edit with
   */
  edit (id: Snowflake, patch: RESTPatchAPIChannelJSONBody): Promise<RESTPatchAPIChannelResult> {
    return this.rest.request('PATCH', `/channels/${id}`, {
      body: patch
    }) as Promise<RESTPatchAPIChannelResult>
  }

  /**
   * Delete a channel
   * @param id ID of channel
   */
  delete (id: Snowflake): Promise<RESTDeleteAPIChannelResult> {
    return this.rest.request('DELETE', `/channels/${id}`) as Promise<RESTDeleteAPIChannelResult>
  }

  private _setPermission (channelId: Snowflake, id: Snowflake, data: RESTPutAPIChannelPermissionJSONBody): Promise<RESTPutAPIChannelPermissionResult> {
    return this.rest.request('PATCH', `/channels/${channelId}/permissions/${id}`, {
      body: data
    }) as Promise<RESTPutAPIChannelPermissionResult>
  }

  /**
   * Sets permissions for a specific role
   * @param id ID of channel
   * @param role Role to set permissions for
   * @param allow BitWise permissions to allow
   * @param deny BitWise permissions to deny
   */
  setRolePermission (id: Snowflake, role: Snowflake, allow?: Permissions, deny?: Permissions): Promise<RESTPutAPIChannelPermissionResult> {
    return this._setPermission(id, role, {
      allow,
      deny,
      type: OverwriteType.Role
    })
  }

  /**
   * Sets permissions for a specific member
   * @param id ID of channel
   * @param member Member to set permissions for
   * @param allow BitWise permissions to allow
   * @param deny BitWise permissions to deny
   */
  setMemberPermission (id: Snowflake, member: Snowflake, allow?: Permissions, deny?: Permissions): Promise<RESTPutAPIChannelPermissionResult> {
    return this._setPermission(id, member, {
      allow,
      deny,
      type: OverwriteType.Member
    })
  }

  /**
   * Remove permissions for a certain overwrite
   * @param id ID of channel
   * @param overwriteId Member or Role ID
   */
  deletePermission (id: Snowflake, overwriteId: Snowflake): Promise<RESTDeleteAPIChannelPermissionResult> {
    return this.rest.request('DELETE', `/channels/${id}/permissions/${overwriteId}`) as Promise<RESTDeleteAPIChannelPermissionResult >
  }

  /**
   * Gets invites in channel
   * @param id ID of channel
   */
  getInvites (id: Snowflake): Promise<RESTGetAPIChannelInvitesResult> {
    return this.rest.request('GET', `/channels/${id}/invites`) as Promise<RESTGetAPIChannelInvitesResult>
  }

  /**
   * Creates an invite for the channel
   * @param id ID of channel
   * @param invite Invite settings
   */
  createInvite (id: Snowflake, invite: RESTPostAPIChannelInviteJSONBody = {} ): Promise<RESTPostAPIChannelInviteResult> {
    return this.rest.request('POST', `/channels/${id}/invites`, {
      body: invite
    })
  }

  /**
   * Gets pins in a channel
   * @param id ID of channel
   */
  getPins (id: Snowflake): Promise<RESTGetAPIChannelPinsResult> {
    return this.rest.request('GET', `/channels/${id}/pins`)
  }

  /**
   * Pins a message
   * @param id ID of channel
   * @param message ID of message to pin
   */
  addPin (id: Snowflake, message: Snowflake): Promise<RESTPutAPIChannelPinResult> {
    return this.rest.request('PUT', `/channels/${id}/pins/${message}`) as RESTPutAPIChannelPinResult
  }

  /**
   * Removes a pin
   * @param id ID of channel
   * @param message ID of message to unpin
   */
  deletePin (id: Snowflake, message: Snowflake): Promise<RESTDeleteAPIChannelPinResult> {
    return this.rest.request('DELETE', `/channels/${id}/pins/${message}`) as RESTDeleteAPIChannelPinResult
  }

  /**
   * Starts typing in channel
   * @param id ID of channel
   */
  typing (id: Snowflake): Promise<RESTPostAPIChannelTypingResult> {
    return this.rest.request('POST', `/channels/${id}/typing`) as RESTPostAPIChannelTypingResult 
  }
}