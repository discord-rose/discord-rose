import { DiscordEventMap } from '../../typings/DiscordEventMap'
import Worker from '../../clustering/worker/Worker'
import Collection from '@discordjs/collection'

// caches
import { guilds } from './guilds'
import { roles } from './roles'
import { channels } from './channels'
import { self } from './self'
import { members } from './members'


import { EventEmitter } from 'events'

const createNulledCollection = (cache: string) => {
  return {
    get: () => { throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`) },
    set: () => { throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`) }
  }
}

export class InternalEvents {
  public events = new EventEmitter()

  constructor (private worker: Worker) {
    const cache = this.worker.options.cache

    if (cache.guilds) guilds(this, this.worker)
    else worker.guilds = createNulledCollection('guilds') as unknown as Collection<null, null>

    if (cache.roles) roles(this, this.worker)
    else worker.guildRoles = createNulledCollection('roles') as unknown as Collection<null, null>

    if (cache.channels) channels(this, this.worker)
    else worker.channels = createNulledCollection('channels') as unknown as Collection<null, null>

    if (cache.self) self(this, this.worker)
    else worker.selfMember = createNulledCollection('self') as unknown as Collection<null, null>

    if (cache.members) members(this, this.worker)
    else worker.members = createNulledCollection('member') as unknown as Collection<null, null>
  }

  add <K extends keyof DiscordEventMap> (event: K, fn: (data: DiscordEventMap[K]) => void) {
    this.events.on(event, fn)

    this.worker.on(event, fn)
  }

  run <K extends keyof DiscordEventMap> (event: K, data: DiscordEventMap[K]) {
    this.events.emit(event, data)
  }
}