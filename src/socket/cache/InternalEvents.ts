import { DiscordEventMap } from '../../typings/DiscordEventMap'
import Worker from '../../clustering/worker/Worker'

// caches
import { guilds } from './guilds'
import { roles } from './roles'
import { channels } from './channels'

import { EventEmitter } from 'events'

export class InternalEvents {
  public events = new EventEmitter()

  constructor (private worker: Worker) {
    const cache = this.worker.options.cache

    if (cache.guilds) guilds(this, this.worker)
    if (cache.roles) roles(this, this.worker)
    if (cache.channels) channels(this, this.worker)
  }

  add <K extends keyof DiscordEventMap> (event: K, fn: (data: DiscordEventMap[K]) => void) {
    this.events.on(event, fn)

    this.worker.on(event, fn)
  }

  run <K extends keyof DiscordEventMap> (event: K, data: DiscordEventMap[K]) {
    this.events.emit(event, data)
  }
}