import { APIMessageReferenceSend, RESTGetAPIChannelMessageReactionUsersQuery, RESTGetAPIChannelMessageReactionUsersResult, RESTGetAPIChannelMessageResult, RESTPatchAPIChannelMessageResult, RESTPostAPIChannelMessageCrosspostResult, RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelMessageResult, RESTPutAPIChannelMessageReactionResult, Snowflake } from 'discord-api-types';
import { Embed } from '../../structures/Embed';
import { RestManager } from '../Manager'

import FormData from 'form-data'

/**
 * ID of custom emoji or unicode emoji
 */
type Emoji = string

export type MessageTypes = RESTPostAPIChannelMessageJSONBody | string | Embed

export class MessagesResource {
  constructor (private rest: RestManager) {}

  static _formMessage (message: MessageTypes): RESTPostAPIChannelMessageJSONBody {
    if (message instanceof Embed) return {
      embed: message.render()
    }
    if (typeof message === 'string') return {
      content: message
    }
    return message
  }

  /**
   * Sends a message to a channel
   * @param channel ID of channel
   * @param data Message data
   */
  send (channel: Snowflake, data: MessageTypes, reply?: APIMessageReferenceSend): Promise<RESTPostAPIChannelMessageResult> {
    const msg = MessagesResource._formMessage(data)
    if (reply) msg.message_reference = reply

    return this.rest.request('POST', `/channels/${channel}/messages`, {
      body: msg
    })
  }

  /**
   * Sends a file to a channel
   * @param channel ID of channel
   * @param data File Buffer
   * @param extra Extra message data
   */
  sendFile (channel: Snowflake, data: { name: string, buffer: Buffer }, extra?: MessageTypes): Promise<RESTPostAPIChannelMessageResult> {
    const formData = new FormData()
    formData.append('file', data.buffer, data.name || 'file')
    if (extra) formData.append('payload_json', JSON.stringify(MessagesResource._formMessage(extra)))

    return this.rest.request('POST', `/channels/${channel}/messages`, {
      body: formData,
      headers: formData.getHeaders(),
      parser: (_) => _
    })
  }

  /**
   * Gets a message
   * @param channel ID of channel
   * @param id ID of message
   */
  get (channel: Snowflake, id: Snowflake): Promise<RESTGetAPIChannelMessageResult> {
    return this.rest.request('GET', `/channels/${channel}/messages/${id}`)
  }
  
  /**
   * Deletes a message
   * @param channel ID of channel
   * @param id ID of message
   */
  delete (channel: Snowflake, id: Snowflake): never {
    return this.rest.request('DELETE', `/channels/${channel}/messages/${id}`) as never
  }

  /**
   * Edits a message
   * @param channel ID of channel
   * @param id ID of message
   * @param data New message data
   */
  edit (channel: Snowflake, id: Snowflake, data: MessageTypes): Promise<RESTPatchAPIChannelMessageResult> {
    return this.rest.request('PATCH', `/channels/${channel}/messages/${id}`, {
      body: MessagesResource._formMessage(data)
    })
  }

  /**
   * Publishes a message in a news channel
   * @param channel ID of channel
   * @param id ID of message
   */
  crosspost (channel: Snowflake, id: Snowflake): Promise<RESTPostAPIChannelMessageCrosspostResult> {
    return this.rest.request('POST', `/channels/${channel}/messages/${id}/crosspost`)
  }

  private _parseEmoji (emoji: Emoji) {
    if (emoji.match(/^[0-9]+$/)) return `<:unknown:${emoji}>`
    return encodeURIComponent(emoji)
  }

  /**
   * Gets users who've reacted with a specific emoji
   * @param channel ID of channel
   * @param id ID of message
   * @param emoji ID or unicode for emoji
   * @param query Query for fetching
   */
  getReactions (channel: Snowflake, id: Snowflake, emoji: Emoji, query?: RESTGetAPIChannelMessageReactionUsersQuery): Promise<RESTGetAPIChannelMessageReactionUsersResult> {
    return this.rest.request('GET', `/channels/${channel}/messages/${id}/reactions/${this._parseEmoji(emoji)}`, {
      query
    }) as Promise<RESTGetAPIChannelMessageReactionUsersResult>
  }

  /**
   * Adds a reaction to a message
   * @param channel ID of channel
   * @param id ID of message
   * @param emoji ID or unicode for emoji
   */
  react (channel: Snowflake, id: Snowflake, emoji: Emoji): Promise<RESTPutAPIChannelMessageReactionResult> {
    return this.rest.request('PUT', `/channels/${channel}/messages/${id}/reactions/${this._parseEmoji(emoji)}/@me`) as RESTPutAPIChannelMessageReactionResult
  }

  /**
   * Removes one reaction for a specific user
   * @param channel ID of channel
   * @param id ID of message
   * @param emoji ID or unicode for emoji
   * @param user Users or leave blank to remove your own
   */
  deleteReaction (channel: Snowflake, id: Snowflake, emoji?: Emoji, user: Snowflake | '@me' = '@me'): Promise<never> {
    return this.rest.request('DELETE', `/channels/${channel}/messages/${id}/reactions/${this._parseEmoji(emoji)}/${user}`) as never
  }

  /**
   * Deletes multiple reactions from a message
   * @param channel ID of channel
   * @param id ID of message
   * @param emoji Emoji ID or unicode, or leave blank to remove all reactions
   */
  deleteAllReactions (channel: Snowflake, id: Snowflake, emoji?: Emoji): Promise<never> {
    return this.rest.request('DELETE', `/channels/${channel}/messages/${id}/reactions${emoji ? `/${this._parseEmoji(emoji)}` : ''}`) as never
  }
}