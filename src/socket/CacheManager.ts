import { DiscordEventMap } from '../typings/Discord'
import { Worker } from '../clustering/worker/Worker'

// caches
import { guilds } from './cache/guilds'
import { defaults } from './cache/defaults'
import { roles } from './cache/roles'
import { channels } from './cache/channels'
import { self } from './cache/self'
import { members } from './cache/members'
import { users } from './cache/users'
import { voiceStates } from './cache/voiceStates'

import { Emitter } from '../utils/Emitter'
import Collection from '@discordjs/collection'

const createNulledCollection = (cache: string): Collection<any, any> => {
  return new Proxy(() => {}, {
    get () {
      throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`)
    },
    apply () {
      throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`)
    }
  }) as unknown as Collection<any, any>
}

/**
 * Utility for managing and ruling cache and it's subsequent control
 */
export class CacheManager extends Emitter<DiscordEventMap> {
  constructor (private readonly worker: Worker) {
    super()

    this.worker.on('*', (data) => {
      this.emit(data.t as any, data.d as any)
    })

    const cache = this.worker.options.cache

    defaults(this, this.worker)

    if (cache.guilds) guilds(this, this.worker)
    else worker.guilds = createNulledCollection('guilds')

    if (cache.roles) roles(this, this.worker)
    else worker.guildRoles = createNulledCollection('roles')

    if (cache.channels) channels(this, this.worker)
    else worker.channels = createNulledCollection('channels')

    if (cache.self) self(this, this.worker)
    else worker.selfMember = createNulledCollection('self')

    if (cache.members) members(this, this.worker)
    else worker.members = createNulledCollection('member')

    if (cache.users) users(this, this.worker)
    else worker.users = createNulledCollection('users')

    if (cache.voiceStates) voiceStates(this, this.worker)
    else worker.voiceStates = createNulledCollection('voiceStates')
  }
}
