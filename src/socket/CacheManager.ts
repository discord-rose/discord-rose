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

import { EventEmitter } from 'events'
import Collection from '@discordjs/collection'

const createNulledCollection = (cache: string) => {
  return {
    get: () => { throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`) },
    set: () => { throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`) }
  } as unknown as Collection<any, any>
}

export class CacheManager {
  public events = new EventEmitter()

  constructor (private worker: Worker) {
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

  add <K extends keyof DiscordEventMap> (event: K, fn: (data: DiscordEventMap[K]) => void) {
    this.events.on(event, fn)

    this.worker.on(event, fn)
  }

  run <K extends keyof DiscordEventMap> (event: K, data: DiscordEventMap[K]) {
    this.events.emit(event, data)
  }
}