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
   * @param {Snowflake} channelID ID of channel
   * @param {*} data Data for new webhook
   */
  async create (channelID: Snowflake, data: RESTPostAPIChannelWebhookJSONBody): Promise<RESTPostAPIChannelWebhookResult> {
    return await this.rest.request('POST', `/channels/${channelID}/webhooks`, {
      body: data
    })
  }

  /**
   * Get a webhook
   * @param {Snowflake} webhookId ID of webhook
   * @param {string} token Token of webhook
   */
  async get (webhookId: Snowflake, token: string): Promise<RESTGetAPIWebhookResult> {
    return await this.rest.request('GET', `/webhooks/${webhookId}/${token}`)
  }

  /**
   * Sends a message via webhook
   * @param {Snowflake} webhookId ID of Webhook
   * @param {string} token Token of Webhook
   * @param {*} data Data for message
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
   * @param {Snowflake} webhookId ID of webhook
   * @param {string?} token Token (if none provided, uses bot permission)
   */
  async delete (webhookId: Snowflake, token?: string): Promise<never> {
    return await this.rest.request('DELETE', `/webhooks/${webhookId}${token ? `/${token}` : ''}`) as never
  }
}
