import { RESTGetAPIGuildPreviewResult, RESTGetAPIGuildQuery, RESTGetAPIGuildRolesResult, RESTPatchAPIGuildJSONBody, RESTPatchAPIGuildRoleJSONBody, RESTPatchAPIGuildRoleResult, RESTPostAPIGuildRoleJSONBody, RESTPostAPIGuildRoleResult, RESTPostAPIGuildsJSONBody, RESTPostAPIGuildsResult, Snowflake } from "discord-api-types";
import { RestManager } from "../Manager";

export class GuildsResource {
  constructor (private rest: RestManager) {}

  /**
   * Gets a guild
   * @param id ID of guild
   * @param withCount Whether or not to add approximation counts
   */
  get (id: Snowflake, withCount: boolean = false): Promise<RESTGetAPIGuildQuery> {
    return this.rest.request('GET', `/guilds/${id}`, {
      query: {
        with_counts: withCount
      }
    })
  }

  /**
   * Edit a guild
   * @param id ID of guild
   * @param data Data to edit with
   */
  edit (id: Snowflake, data: RESTPatchAPIGuildJSONBody): Promise<RESTPatchAPIGuildJSONBody> {
    return this.rest.request('PATCH', `/guilds/${id}`, {
      body: data
    })
  }

  /**
   * Leaves a guild
   * @param id ID of guild
   */
  leave (id: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/users/@me/guilds/${id}`) as never
  }

  /**
   * Gets a list of guilds
   * @param id ID of guild
   */
  getRoles (id: Snowflake): Promise<RESTGetAPIGuildRolesResult> {
    return this.rest.request('GET', `/guilds/${id}/roles`)
  }

  /**
   * Creates a new role
   * @param id ID of guild
   * @param data Data for new role
   */
  createRole (id: Snowflake, data: RESTPostAPIGuildRoleJSONBody): Promise<RESTPostAPIGuildRoleResult> {
    return this.rest.request('POST', `/guilds/${id}/roles`, {
      body: data
    })
  }

  /**
   * Edits an existing role
   * @param id ID of guild
   * @param role ID of role
   * @param data New data for role
   */
  editRole (id: Snowflake, role: Snowflake, data: RESTPatchAPIGuildRoleJSONBody): Promise<RESTPatchAPIGuildRoleResult> {
    return this.rest.request('PATCH', `/guilds/${id}/roles/${role}`, {
      body: data
    })
  }

  /**
   * Deletes a role
   * @param id ID of guild
   * @param role ID of role
   */
  deleteRole (id: Snowflake, role: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/guilds/${id}/roles/${role}`) as never
  }
}