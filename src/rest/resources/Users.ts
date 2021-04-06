import { APIChannel, APIMessage, RESTGetAPIUserResult, RESTPostAPICurrentUserCreateDMChannelResult, Snowflake } from 'discord-api-types'
import { Cache } from '@jpbberry/cache'
import { RestManager } from '../Manager'
import { MessageTypes } from './Messages'

/**
 * Users resource
 */
export class UsersResource {
  public dmCache: Cache<Snowflake, RESTPostAPICurrentUserCreateDMChannelResult> = new Cache(60e3)
  constructor (private readonly rest: RestManager) {}

  /**
   * Get user
   * @param userId User ID or defaults to own user
   */
  async get (userId: Snowflake|'@me' = '@me'): Promise<RESTGetAPIUserResult> {
    return await this.rest.request('GET', `/users/${userId}`)
  }

  /**
   * Creates a DM channel
   * @param userId ID of user
   */
  async createDM (userId: Snowflake): Promise<RESTPostAPICurrentUserCreateDMChannelResult> {
    if (this.dmCache.has(userId)) return this.dmCache.get(userId) as APIChannel
    const channel = await this.rest.request('POST', '/users/@me/channels', {
      body: {
        recipient_id: userId
      }
    })
    this.dmCache.set(userId, channel)

    return channel
  }

  /**
   * Send a DM to user (create's DM channel for you)
   * @param userId ID of user
   * @param message Message data
   */
  async dm (userId: Snowflake, message: MessageTypes): Promise<APIMessage> {
    const channel = await this.createDM(userId)
    return await this.rest.messages.send(channel.id, message)
  }
}
