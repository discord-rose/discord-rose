import { APIMessageReferenceSend, RESTGetAPIChannelMessageReactionUsersQuery, RESTGetAPIChannelMessageReactionUsersResult, RESTGetAPIChannelMessageResult, RESTPatchAPIChannelMessageResult, RESTPostAPIChannelMessageCrosspostResult, RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelMessageResult, RESTPostAPIWebhookWithTokenJSONBody, RESTPutAPIChannelMessageReactionResult, Snowflake } from 'discord-api-types'
import { Embed } from '../../structures/Embed'
import { RestManager } from '../Manager'

import Util from 'util'
import FormData from 'form-data'

/**
 * ID of custom emoji or unicode emoji
 */
type Emoji = string

type StringifiedMessageTypes = string | Function | bigint | number | symbol | undefined

export type MessageTypes = RESTPostAPIChannelMessageJSONBody | RESTPostAPIWebhookWithTokenJSONBody | StringifiedMessageTypes | Embed

/**
 * Message resource
 */
export class MessagesResource {
  constructor (private readonly rest: RestManager) {}

  static _formMessage (message: MessageTypes, webhook?: boolean): RESTPostAPIWebhookWithTokenJSONBody | RESTPostAPIChannelMessageJSONBody {
    if (message instanceof Embed) {
      message = webhook
        ? {
            embeds: [message.render()]
          }
        : {
            embed: message.render()
          }
    } else if (['bigint', 'function', 'number', 'string', 'symbol', 'undefined'].includes(typeof message)) {
      message = {
        content: Util.inspect(message as StringifiedMessageTypes)
      }
    }

    return message as RESTPostAPIWebhookWithTokenJSONBody | RESTPostAPIChannelMessageJSONBody
  }

  /**
   * Sends a message to a channel
   * @param channelId ID of channel
   * @param data Message data
   */
  async send (channelId: Snowflake, data: MessageTypes, reply?: APIMessageReferenceSend): Promise<RESTPostAPIChannelMessageResult> {
    const msg = MessagesResource._formMessage(data) as RESTPostAPIChannelMessageJSONBody
    if (reply) msg.message_reference = reply

    return await this.rest.request('POST', `/channels/${channelId}/messages`, {
      body: msg
    })
  }

  /**
   * Sends a file to a channel
   * @param channelId ID of channel
   * @param data File Buffer and name
   * @param extra Extra message data
   */
  async sendFile (channelId: Snowflake, data: { name: string, buffer: Buffer }, extra?: MessageTypes): Promise<RESTPostAPIChannelMessageResult> {
    const formData = new FormData()
    formData.append('file', data.buffer, data.name || 'file')
    if (extra) formData.append('payload_json', JSON.stringify(MessagesResource._formMessage(extra)))

    return await this.rest.request('POST', `/channels/${channelId}/messages`, {
      body: formData,
      headers: formData.getHeaders(),
      parser: (_) => _
    })
  }

  /**
   * Gets a message
   * @param channelId ID of channel
   * @param messageId ID of message
   */
  async get (channelId: Snowflake, messageId: Snowflake): Promise<RESTGetAPIChannelMessageResult> {
    return await this.rest.request('GET', `/channels/${channelId}/messages/${messageId}`)
  }

  /**
   * Deletes a message
   * @param channelId ID of channel
   * @param messageId ID of message
   */
  async delete (channelId: Snowflake, messageId: Snowflake): Promise<never> {
    return this.rest.request('DELETE', `/channels/${channelId}/messages/${messageId}`) as never
  }

  /**
   * Deletes multiple messages
   * @param channelId ID of channel
   * @param messageIds ID of messages
   */
  async bulkDelete (channelId: Snowflake, messageIds: Snowflake[]): Promise<never> {
    if (messageIds.length < 2) return await this.delete(channelId, messageIds[0])

    return this.rest.request('POST', `/channels/${channelId}/messages/bulk-delete`, {
      body: {
        messages: messageIds
      }
    }) as never
  }

  /**
   * Edits a message
   * @param channelId ID of channel
   * @param messageId ID of message
   * @param data New message data
   */
  async edit (channelId: Snowflake, messageId: Snowflake, data: MessageTypes): Promise<RESTPatchAPIChannelMessageResult> {
    return await this.rest.request('PATCH', `/channels/${channelId}/messages/${messageId}`, {
      body: MessagesResource._formMessage(data)
    })
  }

  /**
   * Publishes a message in a news channel
   * @param channelId ID of channel
   * @param messageId ID of message
   */
  async crosspost (channelId: Snowflake, messageId: Snowflake): Promise<RESTPostAPIChannelMessageCrosspostResult> {
    return await this.rest.request('POST', `/channels/${channelId}/messages/${messageId}/crosspost`)
  }

  private _parseEmoji (emoji: Emoji): string {
    if (emoji.match(/^[0-9]+$/)) return `<:unknown:${emoji}>`
    return encodeURIComponent(emoji)
  }

  /**
   * Gets users who've reacted with a specific emoji
   * @param channelId ID of channel
   * @param messageId ID of message
   * @param emoji ID or unicode for emoji
   * @param query Query for fetching
   */
  async getReactions (channelId: Snowflake, messageId: Snowflake, emoji: Emoji, query?: RESTGetAPIChannelMessageReactionUsersQuery): Promise<RESTGetAPIChannelMessageReactionUsersResult> {
    return await this.rest.request('GET', `/channels/${channelId}/messages/${messageId}/reactions/${this._parseEmoji(emoji)}`, {
      query
    }) as RESTGetAPIChannelMessageReactionUsersResult
  }

  /**
   * Adds a reaction to a message
   * @param channelId ID of channel
   * @param messageId ID of message
   * @param emoji ID or unicode for emoji
   */
  async react (channelId: Snowflake, messageId: Snowflake, emoji: Emoji): Promise<RESTPutAPIChannelMessageReactionResult> {
    return this.rest.request('PUT', `/channels/${channelId}/messages/${messageId}/reactions/${this._parseEmoji(emoji)}/@me`) as RESTPutAPIChannelMessageReactionResult
  }

  /**
   * Removes one reaction for a specific user
   * @param channelId ID of channel
   * @param messageId ID of message
   * @param emoji ID or unicode for emoji
   * @param user Users or leave blank to remove your own
   */
  async deleteReaction (channelId: Snowflake, messageId: Snowflake, emoji: Emoji, user: Snowflake | '@me' = '@me'): Promise<never> {
    return this.rest.request('DELETE', `/channels/${channelId}/messages/${messageId}/reactions/${this._parseEmoji(emoji)}/${user}`) as never
  }

  /**
   * Deletes multiple reactions from a message
   * @param channelId ID of channel
   * @param messageId ID of message
   * @param emoji Emoji ID or unicode, or leave blank to remove all reactions
   */
  async deleteAllReactions (channelId: Snowflake, messageId: Snowflake, emoji?: Emoji): Promise<never> {
    return this.rest.request('DELETE', `/channels/${channelId}/messages/${messageId}/reactions${emoji ? `/${this._parseEmoji(emoji)}` : ''}`) as never
  }
}
