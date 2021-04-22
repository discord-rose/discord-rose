import { RESTGetAPIGuildMemberResult, RESTGetAPIGuildMembersSearchQuery, RESTGetAPIGuildMembersSearchResult, RESTPatchAPICurrentGuildMemberNicknameResult, RESTPatchAPIGuildMemberJSONBody, RESTPatchAPIGuildMemberResult, RESTPutAPIGuildBanJSONBody, Snowflake } from 'discord-api-types'
import { RestManager } from '../Manager'

/**
 * Members resource
 */
export class MembersResource {
  constructor (private readonly rest: RestManager) {}

  /**
   * Gets a member
   * @param guildId ID of guild
   * @param roleId ID of member
   */
  async get (guildId: Snowflake, memberId: Snowflake): Promise<RESTGetAPIGuildMemberResult> {
    return await this.rest.request('GET', `/guilds/${guildId}/members/${memberId}`)
  }

  /**
   * Gets a list of members
   * @param guild ID of guild
   * @param query Query for search
   */
  async getMany (guildId: Snowflake, query: RESTGetAPIGuildMembersSearchQuery): Promise<RESTGetAPIGuildMembersSearchResult> {
    return await this.rest.request('GET', `/guilds/${guildId}/members`, {
      query
    })
  }

  /**
   * Edits a member
   * @param guildId ID of guild
   * @param memberId ID of member
   * @param data New data for member
   */
  // eslint-disable-next-line @typescript-eslint/default-param-last
  async edit (guildId: Snowflake, memberId: Snowflake | '@me' = '@me', data: RESTPatchAPIGuildMemberJSONBody): Promise<RESTPatchAPIGuildMemberResult> {
    return await this.rest.request('PATCH', `/guilds/${guildId}/members/${memberId}`, {
      body: data
    })
  }

  /**
   * Sets a members nickname
   * @param guildId ID of guild
   * @param id ID of member (or leave blank for self)
   * @param nick New nickname (null to reset)
   */
  async setNickname (guildId: Snowflake, memberId: Snowflake | '@me' = '@me', nick: string | null = null): Promise<RESTPatchAPICurrentGuildMemberNicknameResult> {
    if (memberId !== '@me') return await this.edit(guildId, memberId, { nick }) as RESTPatchAPICurrentGuildMemberNicknameResult
    return await this.rest.request('PATCH', `/guilds/${guildId}/members/${memberId}/nick`, {
      body: {
        nick
      }
    })
  }

  /**
   * Adds a role to member
   * @param guildId ID of guild
   * @param memberId ID of member
   * @param roleId ID of role to add
   */
  async addRole (guildId: Snowflake, memberId: Snowflake, roleId: Snowflake): Promise<never> {
    return this.rest.request('PUT', `/guilds/${guildId}/members/${memberId}/roles/${roleId}`) as never
  }

  /**
   * Removes a role from the member
   * @param guildId ID of guild
   * @param memberId ID of member
   * @param roleId ID of role
   */
  async removeRole (guildId: Snowflake, memberId: Snowflake, roleId: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/guilds/${guildId}/members/${memberId}/roles/${roleId}`) as never
  }

  /**
   * Kicks a member
   * @param guildId ID of guild
   * @param memberId ID of member
   * @param reason Reason for kick
   */
  async kick (guildId: Snowflake, memberId: Snowflake, reason?: string): Promise<never> {
    return this.rest.request('DELETE', `/guilds/${guildId}/members/${memberId}`, {
      reason
    }) as never
  }

  /**
   * Bans a member
   * @param guildId ID of guild
   * @param memberId ID of member
   * @param extra Extra, reason for ban and since days of messages to remove
   */
  async ban (guildId: Snowflake, memberId: Snowflake, extra?: RESTPutAPIGuildBanJSONBody): Promise<never> {
    return this.rest.request('PUT', `/guilds/${guildId}/bans/${memberId}`, {
      body: extra
    }) as never
  }

  /**
   * Unbans a member
   * @param guildId ID of guild
   * @param memberId ID of member
   */
  async unban (guildId: Snowflake, memberId: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/guilds/${guildId}/bans/${memberId}`) as never
  }
}
