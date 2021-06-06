import { RESTDeleteAPIGuildEmojiResult, RESTGetAPIGuildEmojiResult, RESTGetAPIGuildEmojisResult, RESTPatchAPIGuildEmojiJSONBody, RESTPatchAPIGuildEmojiResult, RESTPostAPIGuildEmojiJSONBody, RESTPostAPIGuildEmojiResult, Snowflake } from 'discord-api-types';
import { RestManager } from '../Manager';
/**
 * Emojis resource
 */
export declare class EmojisResource {
    private readonly rest;
    constructor(rest: RestManager);
    /**
     * Get a single emoji from a guild
     * @param guildId ID of the emoji's guild
     * @param emojiId The ID of the emoji
     */
    get(guildId: Snowflake, emojiId: Snowflake): Promise<RESTGetAPIGuildEmojiResult>;
    /**
     * Get all emojis from a guild
     * @param guildId ID of the emoji's guild
     */
    getMany(guildId: Snowflake): Promise<RESTGetAPIGuildEmojisResult>;
    /**
     * Create an emoji
     * @param guildId ID of the guild to create the emoji in
     * @param data Emoji data
     */
    create(guildId: Snowflake, data: RESTPostAPIGuildEmojiJSONBody): Promise<RESTPostAPIGuildEmojiResult>;
    /**
     * Edit an emoji
     * @param guildId ID of the emoji's guild
     * @param emojiId The ID of the emoji
     * @param data Data to edit with
     */
    edit(guildId: Snowflake, emojiId: Snowflake, data: RESTPatchAPIGuildEmojiJSONBody): Promise<RESTPatchAPIGuildEmojiResult>;
    /**
     * Delete an emoji
     * @param guildId ID of the emoji's guild
     * @param emojiId The ID of the emoji
     */
    delete(guildId: Snowflake, emojiId: Snowflake): Promise<RESTDeleteAPIGuildEmojiResult>;
}
