import { APIMessage, RESTGetAPIWebhookResult, RESTPostAPIChannelWebhookJSONBody, RESTPostAPIChannelWebhookResult, Snowflake } from 'discord-api-types'
import { RestManager } from '../Manager'
import { MessageTypes, MessagesResource } from './Messages'

export class WebhooksResource {
  constructor (private rest: RestManager) {}

  /**
   * Creates a new webhook on the channel
   * @param channelID ID of channel
   * @param data Data for new webhook
   */
  create (channelID: Snowflake, data: RESTPostAPIChannelWebhookJSONBody): Promise<RESTPostAPIChannelWebhookResult> {
    return this.rest.request('POST', `/channels/${channelID}/webhooks`, {
      body: data
    })
  }

  /**
   * 
   * @param webhookId ID of 
   * @param token 
   */
  get (webhookId: Snowflake, token: string): Promise<RESTGetAPIWebhookResult> {
    return this.rest.request('GET', `/webhooks/${webhookId}/${token}`)
  }

  send (webhookId: Snowflake, token: string, data: MessageTypes): Promise<APIMessage> {
    return this.rest.request('POST', `/webhooks/${webhookId}/${token}`, {
      query: {
        wait: 'true'
      },
      body: MessagesResource._formMessage(data)
    })
  }
}
