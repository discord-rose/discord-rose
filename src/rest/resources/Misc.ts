import { APIGatewayBotInfo } from 'discord-api-types'
import { RestManager } from '../Manager'

export class MiscResource {
  constructor (private readonly rest: RestManager) {}

  async getGateway (): Promise<APIGatewayBotInfo> {
    return await this.rest.request('GET', '/gateway/bot')
  }
}
