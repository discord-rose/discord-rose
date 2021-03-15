import { Worker } from '../../clustering/worker/Worker'
import { CacheManager } from '../CacheManager'

export function defaults (events: CacheManager, worker: Worker): void {
  events.on('USER_UPDATE', (user) => {
    if (user.id === worker.user.id) worker.user = user
  })
}
