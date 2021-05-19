import fetch, { Headers, Response } from 'node-fetch'
import * as qs from 'querystring'

import { Cache } from '@jpbberry/cache'

import { Bucket } from './Bucket'

import { ChannelsResource } from './resources/Channels'
import { MessagesResource } from './resources/Messages'
import { GuildsResource } from './resources/Guilds'
import { InteractionResource } from './resources/Interactions'
import { MembersResource } from './resources/Members'
import { UsersResource } from './resources/Users'
import { MiscResource } from './resources/Misc'
import { WebhooksResource } from './resources/Webhooks'

export interface RestManagerOptions {
  /**
   * The API version number. Be careful as this can cause unexpected behavior.
   * @default 8
   */
  version?: number
}

/**
 * The base rest handler for all things Discord rest
 */
export class RestManager {
  public buckets: Cache<string, Bucket> = new Cache(60000)
  public global: Promise<true> | null = null

  /**
   * Channel resource
   */
  public channels = new ChannelsResource(this)
  /**
   * Messages resource
   */
  public messages = new MessagesResource(this)
  /**
   * Guilds resource
   */
  public guilds = new GuildsResource(this)
  /**
   * Interactions resource
   */
  public interactions = new InteractionResource(this)
  /**
   * Members resource
   */
  public members = new MembersResource(this)
  /**
   * Users resource
   */
  public users = new UsersResource(this)
  /**
   * Misc resource
   */
  public misc = new MiscResource(this)
  /**
   * Webhooks resource
   */
  public webhooks = new WebhooksResource(this)

  public options: RestManagerOptions

  constructor (private readonly token: string, options: RestManagerOptions = {}) {
    this.options = {
      version: options.version ?? 8
    }
  }

  private _key (route: string): string {
    const bucket: string[] = []
    const split = route.split('/')

    for (let i = 0; i < split.length; i++) {
      if (split[i - 1] === 'reactions') break
      if (/\d{16,19}/g.test(split[i]) && !/channels|guilds/.test(split[i - 1])) bucket.push(':id')
      else bucket.push(split[i])
    }

    return bucket.join('-')
  }

  /**
   * Make a custom request
   * @param method Method
   * @param route Route, e.g "/users/123"
   * @param options Other options
   */
  public async request (method: Methods, route: string, options: RequestOptions = {}): Promise<any> {
    return await new Promise((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
      const key = this._key(route)

      let bucket = this.buckets.get(key)

      if (!bucket) {
        bucket = new Bucket(key, this)
        this.buckets.set(key, bucket)
      }

      bucket.add({ method, route, options, resolve, reject })
    })
  }

  /**
   * @internal
   */
  public async make (opts: Request): Promise<{
    res: Response
    json: any
  }|never> {
    const method: Methods = opts.method
    const route: string = opts.route
    const options: RequestOptions = opts.options

    const headers = new Headers()

    if (this.token) headers.set('Authorization', `Bot ${this.token}`)

    if (options.body) headers.set('Content-Type', 'application/json')
    if (options.reason) headers.set('X-Audit-Log-Reason', options.reason)

    headers.set('User-Agent', 'DiscordBot (Discord-Rose, v0)')

    if (options.headers) {
      Object.keys(options.headers).forEach(key => {
        headers.set(key, options.headers?.[key] as string)
      })
    }

    const res = await fetch(`https://discord.com/api/v${this.options.version ?? 8}${route}${options.query ? `?${qs.stringify(options.query)}` : ''}`, {
      method, headers, body: options.body ? (options.parser ?? JSON.stringify)(options.body) : undefined
    })

    const json = res.status === 204 ? null : await res.json()

    return { res, json }
  }
}

type Methods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Request options
 */
interface RequestOptions {
  headers?: {
    [key: string]: string
  }
  query?: any
  body?: any
  reason?: string
  parser?: (data: any) => string
}

export interface Request {
  method: Methods
  route: string
  options: RequestOptions
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}
