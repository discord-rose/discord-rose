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
    if (!this.buckets[bucket]) return
    const next = this.buckets[bucket]?.shift()

    if (next === undefined) {
      this.buckets[bucket] = null
      return
    }

    this.master.shardToCluster(next)?.tell('START_SHARD', { id: next })

    await wait(this.master.options.spawnTimeout)

    return await this.loop(bucket)
  }
}
