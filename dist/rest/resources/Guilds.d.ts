import { RESTGetAPIGuildQuery, RESTGetAPIGuildRolesResult, RESTPatchAPIGuildJSONBody, RESTPatchAPIGuildRoleJSONBody, RESTPatchAPIGuildRoleResult, RESTPostAPIGuildRoleJSONBody, RESTPostAPIGuildRoleResult, Snowflake } from 'discord-api-types';
import { RestManager } from '../Manager';
/**
 * Guilds resource
 */
export declare class GuildsResource {
    private readonly rest;
    constructor(rest: RestManager);
    /**
     * Gets a guild
     * @param {Snowflake} guildId ID of guild
     * @param {boolean} withCount Whether or not to add approximation counts
     */
    get(guildId: Snowflake, withCount?: boolean): Promise<RESTGetAPIGuildQuery>;
    /**
     * Edit a guild
     * @param {Snowflake} guildId ID of guild
     * @param {*} data Data to edit with
     */
    edit(guildId: Snowflake, data: RESTPatchAPIGuildJSONBody): Promise<RESTPatchAPIGuildJSONBody>;
    /**
     * Leaves a guild
     * @param {Snowflake} guildId ID of guild
     */
    leave(guildId: Snowflake): Promise<never>;
    /**
     * Gets a list of guilds
     * @param {Snowflake} guildId ID of guild
     */
    getRoles(guildId: Snowflake): Promise<RESTGetAPIGuildRolesResult>;
    /**
     * Creates a new role
     * @param {Snowflake} guildId ID of guild
     * @param {*} data Data for new role
     */
    createRole(guildId: Snowflake, data: RESTPostAPIGuildRoleJSONBody): Promise<RESTPostAPIGuildRoleResult>;
    /**
     * Edits an existing role
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} roleId ID of role
     * @param {*} data New data for role
     */
    editRole(guildId: Snowflake, roleId: Snowflake, data: RESTPatchAPIGuildRoleJSONBody): Promise<RESTPatchAPIGuildRoleResult>;
    /**
     * Deletes a role
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} roleId ID of role
     */
    deleteRole(guildId: Snowflake, roleId: Snowflake): Promise<never>;
}
