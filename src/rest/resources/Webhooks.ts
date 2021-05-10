import { APIMessage, RESTGetAPIWebhookResult, RESTPostAPIChannelWebhookJSONBody, RESTPostAPIChannelWebhookResult, Snowflake } from 'discord-api-types'
import { RestManager } from '../Manager'
import { MessageTypes, MessagesResource } from './Messages'

/**
 * Webhook resource
 */
export class WebhooksResource {
  constructor (private readonly rest: RestManager) {}

  /**
   * Creates a new webhook on the channel
   * @param channelId ID of channel
   * @param data Data for new webhook
   */
  async create (channelId: Snowflake, data: RESTPostAPIChannelWebhookJSONBody): Promise<RESTPostAPIChannelWebhookResult> {
    return await this.rest.request('POST', `/channels/${channelId}/webhooks`, {
      body: data
    })
  }

  /**
   * Get a webhook
   * @param webhookId ID of webhook
   * @param token Token of webhook
   */
  async get (webhookId: Snowflake, token: string): Promise<RESTGetAPIWebhookResult> {
    return await this.rest.request('GET', `/webhooks/${webhookId}/${token}`)
  }

  /**
   * Sends a message via webhook
   * @param webhookId ID of Webhook
   * @param token Token of Webhook
   * @param data Data for message
   */
  async send (webhookId: Snowflake, token: string, data: MessageTypes): Promise<APIMessage> {
    return await this.rest.request('POST', `/webhooks/${webhookId}/${token}`, {
      query: {
        wait: 'true'
      },
      body: MessagesResource._formMessage(data, true)
    })
  }

  /**
   * Deletes a webhook
   * @param webhookId ID of webhook
   * @param token Token (if none provided, uses bot permission)
   */
  async delete (webhookId: Snowflake, token?: string): Promise<never> {
    return await this.rest.request('DELETE', `/webhooks/${webhookId}${token ? `/${token}` : ''}`) as never
  }

  /**
   * Edits a message sent by a webhook with it's token
   * @param webhookId ID of Webhook
   * @param token Token of Webhook
   * @param messageId ID of message
   * @param data Message data to replace
   * @returns New message
   */
  async editMessage (webhookId: Snowflake, token: string, messageId: Snowflake, data: MessageTypes): Promise<APIMessage> {
    return await this.rest.request('PATCH', `/webhooks/${webhookId}/${token}/messages/${messageId}`, {
      body: MessagesResource._formMessage(data, true)
    })
  }

  /**
   * Deletes a message sent by a webhook with it's token
   * @param webhookId ID of Webhook
   * @param token Token of Webhook
   * @param messageId ID of message
   */
  async deleteMessage (webhookId: Snowflake, token: string, messageId: Snowflake): Promise<null> {
    return await this.rest.request('DELETE', `/webhooks/${webhookId}/${token}/messages/${messageId}`)
  }
}
