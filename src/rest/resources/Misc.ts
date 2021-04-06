import { APIGatewayBotInfo } from 'discord-api-types'
import { RestManager } from '../Manager'

/**
 * Miscellanious resource
 */
export class MiscResource {
  constructor (private readonly rest: RestManager) {}

  /**
   * Get gateway endpoint
   */
  async getGateway (): Promise<APIGatewayBotInfo> {
    return await this.rest.request('GET', '/gateway/bot')
  }
}
