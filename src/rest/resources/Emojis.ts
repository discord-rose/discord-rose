import { RESTDeleteAPIGuildEmojiResult, RESTGetAPIGuildEmojiResult, RESTGetAPIGuildEmojisResult, RESTPatchAPIGuildEmojiJSONBody, RESTPatchAPIGuildEmojiResult, RESTPostAPIGuildEmojiJSONBody, RESTPostAPIGuildEmojiResult, Snowflake } from 'discord-api-types'
import { RestManager } from '../Manager'

/**
 * Emojis resource
 */
export class EmojisResource {
  constructor (private readonly rest: RestManager) {}

  /**
   * Gets all emojis in a guild, or a single emoji from a guild
   * @param guildId ID of the emoji's guild
   * @param emojiId The ID of the emoji
   */
  async get (guildId: Snowflake, emojiId?: Snowflake): Promise<RESTGetAPIGuildEmojisResult | RESTGetAPIGuildEmojiResult> {
    return await this.rest.request('GET', `/guilds/${guildId}/emojis${emojiId ? `/${emojiId}` : ''}`)
  }

  /**
   * Create an emoji
   * @param guildId ID of the guild to create the emoji in
   * @param data Emoji data
   */
  async create (guildId: Snowflake, data: RESTPostAPIGuildEmojiJSONBody): Promise<RESTPostAPIGuildEmojiResult> {
    return await this.rest.request('POST', `/guilds/${guildId}/emojis`, {
      body: data
    })
  }

  /**
   * Edit an emoji
   * @param guildId ID of the emoji's guild
   * @param emojiId The ID of the emoji
   * @param data Data to edit with
   */
  async edit (guildId: Snowflake, emojiId: Snowflake, data: RESTPatchAPIGuildEmojiJSONBody): Promise<RESTPatchAPIGuildEmojiResult> {
    return await this.rest.request('PATCH', `/guilds/${guildId}/emojis/${emojiId}`, {
      body: data
    })
  }

  /**
   * Delete an emoji
   * @param guildId ID of the emoji's guild
   * @param emojiId The ID of the emoji
   */
  async delete (guildId: Snowflake, emojiId: Snowflake): Promise<RESTDeleteAPIGuildEmojiResult> {
    return await this.rest.request('DELETE', `/guilds/${guildId}/emojis/${emojiId}`) as RESTDeleteAPIGuildEmojiResult
  }
}
