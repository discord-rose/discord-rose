import { RESTGetAPIGuildQuery, RESTGetAPIGuildRolesResult, RESTPatchAPIGuildJSONBody, RESTPatchAPIGuildRoleJSONBody, RESTPatchAPIGuildRoleResult, RESTPostAPIGuildRoleJSONBody, RESTPostAPIGuildRoleResult, RESTPostAPIGuildsJSONBody, RESTPostAPIGuildsResult, Snowflake } from "discord-api-types";
import { RestManager } from "../Manager";

export class GuildsResource {
  constructor (private rest: RestManager) {}

  /**
   * Gets a guild
   * @param guildId ID of guild
   * @param withCount Whether or not to add approximation counts
   */
  get (guildId: Snowflake, withCount: boolean = false): Promise<RESTGetAPIGuildQuery> {
    return this.rest.request('GET', `/guilds/${guildId}`, {
      query: {
        with_counts: withCount
      }
    })
  }

  /**
   * Edit a guild
   * @param guildId ID of guild
   * @param data Data to edit with
   */
  edit (guildId: Snowflake, data: RESTPatchAPIGuildJSONBody): Promise<RESTPatchAPIGuildJSONBody> {
    return this.rest.request('PATCH', `/guilds/${guildId}`, {
      body: data
    })
  }

  /**
   * Leaves a guild
   * @param guildId ID of guild
   */
  leave (guildId: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/users/@me/guilds/${guildId}`) as never
  }

  /**
   * Gets a list of guilds
   * @param guildId ID of guild
   */
  getRoles (guildId: Snowflake): Promise<RESTGetAPIGuildRolesResult> {
    return this.rest.request('GET', `/guilds/${guildId}/roles`)
  }

  /**
   * Creates a new role
   * @param guildId ID of guild
   * @param data Data for new role
   */
  createRole (guildId: Snowflake, data: RESTPostAPIGuildRoleJSONBody): Promise<RESTPostAPIGuildRoleResult> {
    return this.rest.request('POST', `/guilds/${guildId}/roles`, {
      body: data
    })
  }

  /**
   * Edits an existing role
   * @param guildId ID of guild
   * @param roleId ID of role
   * @param data New data for role
   */
  editRole (guildId: Snowflake, roleId: Snowflake, data: RESTPatchAPIGuildRoleJSONBody): Promise<RESTPatchAPIGuildRoleResult> {
    return this.rest.request('PATCH', `/guilds/${guildId}/roles/${roleId}`, {
      body: data
    })
  }

  /**
   * Deletes a role
   * @param guildId ID of guild
   * @param roleId ID of role
   */
  deleteRole (guildId: Snowflake, roleId: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/guilds/${guildId}/roles/${roleId}`) as never
  }
}