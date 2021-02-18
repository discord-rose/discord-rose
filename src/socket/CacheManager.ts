import { DiscordEventMap } from '../typings/Discord'
import Worker from '../clustering/worker/Worker'

// caches
import { guilds } from './cache/guilds'
import { defaults } from './cache/defaults'
import { roles } from './cache/roles'
import { channels } from './cache/channels'
import { self } from './cache/self'
import { members } from './cache/members'


import { EventEmitter } from 'events'

const createNulledCollection = (cache: string) => {
  return {
    get: () => { throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`) },
    set: () => { throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`) }
  }
}

export class CacheManager {
  public events = new EventEmitter()

  constructor (private worker: Worker) {
    const cache = this.worker.options.cache

    defaults(this, this.worker)

    if (cache.guilds) guilds(this, this.worker)
    else worker.guilds = createNulledCollection('guilds') as unknown as typeof worker.guilds

    if (cache.roles) roles(this, this.worker)
    else worker.guildRoles = createNulledCollection('roles') as unknown as typeof worker.guildRoles

    if (cache.channels) channels(this, this.worker)
    else worker.channels = createNulledCollection('channels') as unknown as typeof worker.channels

    if (cache.self) self(this, this.worker)
    else worker.selfMember = createNulledCollection('self') as unknown as typeof worker.selfMember

    if (cache.members) members(this, this.worker)
    else worker.members = createNulledCollection('member') as unknown as typeof worker.members
  }

  add <K extends keyof DiscordEventMap> (event: K, fn: (data: DiscordEventMap[K]) => void) {
    this.events.on(event, fn)

    this.worker.on(event, fn)
  }

  run <K extends keyof DiscordEventMap> (event: K, data: DiscordEventMap[K]) {
    this.events.emit(event, data)
  }
}