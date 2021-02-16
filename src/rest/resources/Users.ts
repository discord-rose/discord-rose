import { RESTGetAPIUserResult, RESTPostAPICurrentUserCreateDMChannelResult, Snowflake } from 'discord-api-types';
import { Cache } from '../../utils/Cache';
import { RestManager } from '../Manager'
import { MessageTypes } from './Messages'

export class UsersResource {
  public dmCache: Cache<Snowflake, RESTPostAPICurrentUserCreateDMChannelResult> = new Cache(60e3)
  constructor (private rest: RestManager) {}

  /**
   * Get user
   * @param id User ID or defaults to own user
   */
  get (id: Snowflake|'@me' = '@me'): Promise<RESTGetAPIUserResult> {
    return this.rest.request('GET', `/users/${id}`)
  }

  /**
   * Creates a DM channel
   * @param id ID of user
   */
  async createDM (id: Snowflake): Promise<RESTPostAPICurrentUserCreateDMChannelResult> {
    if (this.dmCache.has(id)) return this.dmCache.get(id)
    const channel = await this.rest.request('POST', '/users/@me/channels', {
      body: {
        recipient_id: id
      }
    })
    this.dmCache.set(id, channel)

    return channel
  }

  /**
   * Send a DM to user (create's DM channel for you)
   * @param id ID of user
   * @param message Message data
   */
  async dm (id: Snowflake, message: MessageTypes) {
    const channel = await this.createDM(id)
    return this.rest.messages.send(channel.id, message)
  }
}