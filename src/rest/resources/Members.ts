import { RESTGetAPIGuildMemberResult, RESTGetAPIGuildMembersSearchQuery, RESTGetAPIGuildMembersSearchResult, RESTPatchAPICurrentGuildMemberNicknameResult, RESTPatchAPIGuildMemberJSONBody, RESTPatchAPIGuildMemberResult, RESTPutAPIGuildBanJSONBody, Snowflake } from "discord-api-types";
import { RestManager } from "../Manager";

export class MembersResource {
  constructor (private rest: RestManager) {}

  /**
   * Gets a member
   * @param guild ID of guild
   * @param id ID of member
   */
  get (guild: Snowflake, id: Snowflake): Promise<RESTGetAPIGuildMemberResult> {
    return this.rest.request('GET', `/guilds/${guild}/members/${id}`)
  }

  /**
   * Gets a list of members
   * @param guild ID of guild
   * @param query Query for search
   */
  getMany (guild: Snowflake, query: RESTGetAPIGuildMembersSearchQuery): Promise<RESTGetAPIGuildMembersSearchResult> {
    return this.rest.request('GET', `/guilds/${guild}/members`, {
      query
    })
  }

  /**
   * Edits a member
   * @param guild ID of guild
   * @param id ID of member
   * @param data New data for member
   */
  edit (guild: Snowflake, id: Snowflake, data: RESTPatchAPIGuildMemberJSONBody): Promise<RESTPatchAPIGuildMemberResult> {
    return this.rest.request('PATCH', `/guilds/${guild}/members/${id}`, {
      body: data
    })
  }

  /**
   * Sets a members nickname
   * @param guild ID of guild
   * @param id ID of member (or leave blank for self)
   * @param nick New nickname (null to reset)
   */
  setNickname (guild: Snowflake, id: Snowflake | '@me' = '@me', nick?: string): Promise<RESTPatchAPICurrentGuildMemberNicknameResult> {
    return this.rest.request('PATCH', `/guilds/${guild}/members/${id}/nick`, {
      body: {
        nick
      }
    })
  }

  /**
   * Adds a role to member
   * @param guild ID of guild
   * @param id ID of member
   * @param role ID of role to add
   */
  addRole (guild: Snowflake, id: Snowflake, role: Snowflake): Promise<never> {
    return this.rest.request('PUT', `/guilds/${guild}/members/${id}/roles/${role}`) as never
  }

  /**
   * Removes a role from the member
   * @param guild ID of guild
   * @param id ID of member
   * @param role ID of role
   */
  removeRole (guild: Snowflake, id: Snowflake, role: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/guilds/${guild}/members/${id}/roles/${role}`) as never
  }

  /**
   * Kicks a member
   * @param guild ID of guild
   * @param id ID of member
   * @param reason Reason for kick
   */
  kick (guild: Snowflake, id: Snowflake, reason: string): Promise<never> {
    return this.rest.request('DELETE', `/guilds/${guild}/members/${id}`, {
      reason
    }) as never
  }

  /**
   * Bans a member
   * @param guild ID of guild
   * @param id ID of member
   * @param extra Extra, reason for ban and since days of messages to remove
   */
  ban (guild: Snowflake, id: Snowflake, extra?: RESTPutAPIGuildBanJSONBody): Promise<never> {
    return this.rest.request('PUT', `/guilds/${guild}/bans/${id}`, {
      body: extra
    }) as never
  }

  /**
   * Unbans a member
   * @param guild ID of guild
   * @param id ID of member
   */
  unban (guild: Snowflake, id: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/guilds/${guild}/bans/${id}`) as never
  }
}