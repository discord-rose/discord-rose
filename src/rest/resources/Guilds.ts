import { RESTGetAPIAuditLogResult, RESTGetAPIAuditLogQuery, RESTGetAPIGuildQuery, RESTGetAPIGuildRolesResult, RESTPatchAPIGuildJSONBody, RESTPatchAPIGuildRoleJSONBody, RESTPatchAPIGuildRoleResult, RESTPostAPIGuildRoleJSONBody, RESTPostAPIGuildRoleResult, Snowflake } from 'discord-api-types'
import { RestManager } from '../Manager'

/**
 * Guilds resource
 */
export class GuildsResource {
  constructor (private readonly rest: RestManager) {}

  /**
   * Gets a guild
   * @param guildId ID of guild
   * @param withCount Whether or not to add approximation counts
   */
  async get (guildId: Snowflake, withCount: boolean = false): Promise<RESTGetAPIGuildQuery> {
    return await this.rest.request('GET', `/guilds/${guildId}`, {
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
  async edit (guildId: Snowflake, data: RESTPatchAPIGuildJSONBody): Promise<RESTPatchAPIGuildJSONBody> {
    return await this.rest.request('PATCH', `/guilds/${guildId}`, {
      body: data
    })
  }

  /**
   * Leaves a guild
   * @param guildId ID of guild
   */
  async leave (guildId: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/users/@me/guilds/${guildId}`) as never
  }

  /**
   * Gets a list of guilds
   * @param guildId ID of guild
   */
  async getRoles (guildId: Snowflake): Promise<RESTGetAPIGuildRolesResult> {
    return await this.rest.request('GET', `/guilds/${guildId}/roles`)
  }

  /**
   * Creates a new role
   * @param guildId ID of guild
   * @param data Data for new role
   */
  async createRole (guildId: Snowflake, data: RESTPostAPIGuildRoleJSONBody): Promise<RESTPostAPIGuildRoleResult> {
    return await this.rest.request('POST', `/guilds/${guildId}/roles`, {
      body: data
    })
  }

  /**
   * Edits an existing role
   * @param guildId ID of guild
   * @param roleId ID of role
   * @param data New data for role
   */
  async editRole (guildId: Snowflake, roleId: Snowflake, data: RESTPatchAPIGuildRoleJSONBody): Promise<RESTPatchAPIGuildRoleResult> {
    return await this.rest.request('PATCH', `/guilds/${guildId}/roles/${roleId}`, {
      body: data
    })
  }

  /**
   * Deletes a role
   * @param guildId ID of guild
   * @param roleId ID of role
   */
  async deleteRole (guildId: Snowflake, roleId: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/guilds/${guildId}/roles/${roleId}`) as never
  }

  /**
   * Gets audit-log entries
   * @param guildId ID of guild
   * @param data Query paramaters
   */
  async getAuditLog (guildId: Snowflake, query: RESTGetAPIAuditLogQuery): Promise<RESTGetAPIAuditLogResult> {
    return this.rest.request('GET', `/guilds/${guildId}/audit-logs`, {
      query: query
    })
  }
}
