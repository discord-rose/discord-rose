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

import { Emitter } from '../utils/Emitter'
import Collection from '@discordjs/collection'

const createNulledCollection = (cache: string) => {
  return {
    get: () => { throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`) },
    set: () => { throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`) }
  } as unknown as Collection<any, any>
}

export class CacheManager extends Emitter<DiscordEventMap> {
  constructor (private worker: Worker) {
    super()

    this.worker.on('*', (data) => {
      this.emit(data.t, data.d as any)
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
  }
}