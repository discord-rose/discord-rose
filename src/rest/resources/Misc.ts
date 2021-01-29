import { APIGatewayBotInfo } from 'discord-api-types';
import { RestManager } from '../Manager'

export class MiscResource {
  constructor (private rest: RestManager) {}

  getGateway (): Promise<APIGatewayBotInfo> {
    return this.rest.request('GET', '/gateway/bot')
  }
}