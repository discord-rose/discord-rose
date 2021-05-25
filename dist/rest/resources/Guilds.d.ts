import { RESTGetAPIAuditLogResult, RESTGetAPIAuditLogQuery, RESTGetAPIGuildRolesResult, RESTPatchAPIGuildJSONBody, RESTPatchAPIGuildRoleJSONBody, RESTPatchAPIGuildRoleResult, RESTPostAPIGuildRoleJSONBody, RESTPostAPIGuildRoleResult, Snowflake, RESTGetAPIGuildResult, RESTPatchAPIGuildResult } from 'discord-api-types';
import { RestManager } from '../Manager';
/**
 * Guilds resource
 */
export declare class GuildsResource {
    private readonly rest;
    constructor(rest: RestManager);
    /**
     * Gets a guild
     * @param guildId ID of guild
     * @param withCount Whether or not to add approximation counts
     */
    get(guildId: Snowflake, withCount?: boolean): Promise<RESTGetAPIGuildResult>;
    /**
     * Edit a guild
     * @param guildId ID of guild
     * @param data Data to edit with
     */
    edit(guildId: Snowflake, data: RESTPatchAPIGuildJSONBody): Promise<RESTPatchAPIGuildResult>;
    /**
     * Leaves a guild
     * @param guildId ID of guild
     */
    leave(guildId: Snowflake): Promise<never>;
    /**
     * Gets a list of guilds
     * @param guildId ID of guild
     */
    getRoles(guildId: Snowflake): Promise<RESTGetAPIGuildRolesResult>;
    /**
     * Creates a new role
     * @param guildId ID of guild
     * @param data Data for new role
     */
    createRole(guildId: Snowflake, data: RESTPostAPIGuildRoleJSONBody): Promise<RESTPostAPIGuildRoleResult>;
    /**
     * Edits an existing role
     * @param guildId ID of guild
     * @param roleId ID of role
     * @param data New data for role
     */
    editRole(guildId: Snowflake, roleId: Snowflake, data: RESTPatchAPIGuildRoleJSONBody): Promise<RESTPatchAPIGuildRoleResult>;
    /**
     * Deletes a role
     * @param guildId ID of guild
     * @param roleId ID of role
     */
    deleteRole(guildId: Snowflake, roleId: Snowflake): Promise<never>;
    /**
     * Gets audit-log entries
     * @param guildId ID of guild
     * @param data Query paramaters
     */
    getAuditLogs(guildId: Snowflake, query: RESTGetAPIAuditLogQuery): Promise<RESTGetAPIAuditLogResult>;
}
