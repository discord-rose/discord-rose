import { Master } from './Master'

import { wait } from '../../utils/UtilityFunctions'

/**
 * Sharder in charge of handling shard spawn ratelimtis
 */
export class Sharder {
  public buckets: Array<number[]|null> = []

  constructor (public master: Master) {}

  register (id: number): void {
    const bucket = id % this.master.session.max_concurrency

    let running = true

    if (!this.buckets[bucket]) {
      running = false
      this.buckets[bucket] = []
    }

    if (!this.buckets[bucket]?.includes(id)) {
      this.buckets[bucket]?.push(id)
    }

    this.buckets[bucket] = this.buckets[bucket]?.sort((a, b) => a - b) as number[]

    if (!running && this.master.spawned) void this.loop(bucket)
  }

  async loop (bucket: number): Promise<void> {
    this.master.debug(`Looping bucket #${bucket}`)
    if (!this.buckets[bucket]) return
    const next = this.buckets[bucket]?.shift()

    if (next === undefined) {
      this.buckets[bucket] = null
      this.master.debug(`Reached end of bucket #${bucket}`)
      return
    }

    const waiting = await this.master.shardToCluster(next)?.sendCommand('START_SHARD', { id: next })
      .then(res => {
        return !res.err
      })
      .catch(() => {
        this.master.log(`Shard ${next} failed to startup in time. Continuing.`)
        return true
      })

    if (waiting) await wait(this.master.options.spawnTimeout)
    else await wait(500)

    return await this.loop(bucket)
  }
}
