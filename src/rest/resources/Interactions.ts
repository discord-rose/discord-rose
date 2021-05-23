import { InteractionResponseType, RESTGetAPIApplicationCommandsResult, RESTGetAPIApplicationGuildCommandsResult, RESTPatchAPIApplicationCommandJSONBody, RESTPatchAPIApplicationCommandResult, RESTPatchAPIApplicationGuildCommandJSONBody, RESTPatchAPIApplicationGuildCommandResult, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIApplicationGuildCommandsJSONBody, RESTPostAPIApplicationGuildCommandsResult, RESTPostAPIInteractionCallbackJSONBody, RESTPutAPIApplicationCommandsJSONBody, RESTPutAPIApplicationCommandsResult, RESTPutAPIApplicationGuildCommandsJSONBody, RESTPutAPIApplicationGuildCommandsResult, Snowflake } from 'discord-api-types'
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
  async set (data: RESTPutAPIApplicationCommandsJSONBody | RESTPutAPIApplicationGuildCommandsJSONBody, applicationId: Snowflake, guildId?: Snowflake): Promise<RESTPutAPIApplicationCommandsResult | RESTPutAPIApplicationGuildCommandsResult> {
    return await this.rest.request('PUT', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands`, {
      body: data
    })
  }

  /**
   * Gets all posted commands for an application
   * @param applicationId Application/client ID
   * @param guildId Optional guild ID to only get commands from a specific guild
   */
  async get (applicationId: Snowflake, guildId?: Snowflake): Promise<RESTGetAPIApplicationCommandsResult | RESTGetAPIApplicationGuildCommandsResult> {
    return await this.rest.request('GET', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands`)
  }

  /**
   * Adds a command for an application
   * @param data Interaction data
   * @param applicationId Application/client ID
   * @param guildId Optional guild ID to only add a command for a specific guild
   */
  async add (data: RESTPostAPIApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody, applicationId: Snowflake, guildId?: Snowflake): Promise<RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult> {
    return await this.rest.request('POST', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands`, {
      body: data
    })
  }

  /**
   * Deletes a specific command for an application
   * @param interactionId Interaction ID
   * @param applicationId Application/client ID
   * @param guildId Optional guild ID to only delete a command for a specific guild
   */
  async delete (interactionId: Snowflake, applicationId: Snowflake, guildId?: Snowflake): Promise<void> {
    await this.rest.request('DELETE', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}/commands/${interactionId}`)
  }

  /**
   * Updates/upserts a specific command
   * @param data Interaction data
   * @param interactionId Interaction ID
   * @param applicationId Application/client ID
   * @param guildId Optional guild ID to only update a command for a specific guild
   */
  async update (data: RESTPatchAPIApplicationCommandJSONBody | RESTPatchAPIApplicationGuildCommandJSONBody, interactionId: Snowflake, applicationId: Snowflake, guildId?: Snowflake): Promise<RESTPatchAPIApplicationCommandResult | RESTPatchAPIApplicationGuildCommandResult> {
    return await this.rest.request('PATCH', `/applications/${applicationId}/${guildId ? `/guilds/${guildId}/` : ''}commands/${interactionId}`, {
      body: data
    })
  }

  /**
   * Responds to an interaction
   * @param interactionId Interaction ID
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
