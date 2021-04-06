import { RESTGetAPIGuildMemberResult, RESTGetAPIGuildMembersSearchQuery, RESTGetAPIGuildMembersSearchResult, RESTPatchAPICurrentGuildMemberNicknameResult, RESTPatchAPIGuildMemberJSONBody, RESTPatchAPIGuildMemberResult, RESTPutAPIGuildBanJSONBody, Snowflake } from 'discord-api-types';
import { RestManager } from '../Manager';
/**
 * Members resource
 */
export declare class MembersResource {
    private readonly rest;
    constructor(rest: RestManager);
    /**
     * Gets a member
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} roleId ID of member
     */
    get(guildId: Snowflake, memberId: Snowflake): Promise<RESTGetAPIGuildMemberResult>;
    /**
     * Gets a list of members
     * @param {Snowflake} guild ID of guild
     * @param {*} query Query for search
     */
    getMany(guildId: Snowflake, query: RESTGetAPIGuildMembersSearchQuery): Promise<RESTGetAPIGuildMembersSearchResult>;
    /**
     * Edits a member
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} memberId ID of member
     * @param {*} data New data for member
     */
    edit(guildId: Snowflake, memberId: `${bigint}` | "@me" | undefined, data: RESTPatchAPIGuildMemberJSONBody): Promise<RESTPatchAPIGuildMemberResult>;
    /**
     * Sets a members nickname
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} id ID of member (or leave blank for self)
     * @param {string?} nick New nickname (null to reset)
     */
    setNickname(guildId: Snowflake, memberId?: Snowflake | '@me', nick?: string): Promise<RESTPatchAPICurrentGuildMemberNicknameResult>;
    /**
     * Adds a role to member
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} memberId ID of member
     * @param {Snowflake} roleId ID of role to add
     */
    addRole(guildId: Snowflake, memberId: Snowflake, roleId: Snowflake): Promise<never>;
    /**
     * Removes a role from the member
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} memberId ID of member
     * @param {Snowflake} roleId ID of role
     */
    removeRole(guildId: Snowflake, memberId: Snowflake, roleId: Snowflake): Promise<never>;
    /**
     * Kicks a member
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} memberId ID of member
     * @param {string?} reason Reason for kick
     */
    kick(guildId: Snowflake, memberId: Snowflake, reason?: string): Promise<never>;
    /**
     * Bans a member
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} memberId ID of member
     * @param {*} extra Extra, reason for ban and since days of messages to remove
     */
    ban(guildId: Snowflake, memberId: Snowflake, extra?: RESTPutAPIGuildBanJSONBody): Promise<never>;
    /**
     * Unbans a member
     * @param {Snowflake} guildId ID of guild
     * @param {Snowflake} memberId ID of member
     */
    unban(guildId: Snowflake, memberId: Snowflake): Promise<never>;
}
