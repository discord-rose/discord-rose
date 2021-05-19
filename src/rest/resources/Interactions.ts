import { InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIInteractionCallbackJSONBody, RESTPutAPIApplicationCommandsJSONBody, Snowflake } from 'discord-api-types'
import FormData from 'form-data'
import { RestManager } from '../Manager'
import { MessagesResource, MessageTypes } from './Messages'

/**
 * Interactions resource
 */
export class InteractionResource {
  constructor (private readonly rest: RestManager) {}
  /**
   * Sets all commands for an application, clearing previous
   * @param data An array of interaction data
   * @param applicationId Application/client ID
   * @param guildId Optional guild ID to only set commands for specific guild
   */
  async set (data: RESTPutAPIApplicationCommandsJSONBody, applicationId: Snowflake, guildId?: Snowflake): Promise<RESTPostAPIApplicationCommandsResult> {
    return await this.rest.request('PUT', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands`, {
      body: data
    })
  }

  /**
   * Updates/upserts a specific command
   * @param data Interaction data
   * @param applicationId Application/client ID
   * @param commandId Command ID to replace
   * @param guildId Optional guild ID to only set command to specific guild
   */
  async update (data: RESTPostAPIApplicationCommandsJSONBody, applicationId: Snowflake, commandId?: string, guildId?: Snowflake): Promise<RESTPostAPIApplicationCommandsResult> {
    return await this.rest.request('PATCH', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands/${commandId ?? data.name}`, {
      body: data
    })
  }

  /**
   * Responds to an interaction
   * @param interactionId Interact ID
   * @param interactionToken Interaction Token
   * @param data Interaction Callback Data
   */
  async callback (interactionId: Snowflake, interactionToken: string, data: RESTPostAPIInteractionCallbackJSONBody): Promise<null> {
    if (data.type === InteractionResponseType.ChannelMessageWithSource) {
      if (data.data) data.data = MessagesResource._formMessage(data.data, true)
    }

    return await this.rest.request('POST', `/interactions/${interactionId}/${interactionToken}/callback`, {
      body: data
    })
  }

  /**
   * Sends a file to a channel
   * @param channelId ID of channel
   * @param data File Buffer and name
   * @param extra Extra message data
   */
  async callbackFile (interactionId: Snowflake, interactionToken: string, data: { name: string, buffer: Buffer }, extra?: MessageTypes): Promise<null> {
    const formData = new FormData()
    formData.append('file', data.buffer, data.name || 'file')
    if (extra) formData.append('payload_json', JSON.stringify(MessagesResource._formMessage(extra)))

    return await this.rest.request('POST', `/interactions/${interactionId}/${interactionToken}/callback`, {
      body: formData,
      headers: formData.getHeaders(),
      parser: (_) => _
    })
  }
}
