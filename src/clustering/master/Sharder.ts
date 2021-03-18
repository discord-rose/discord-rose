import { Master } from './Master'

import { wait } from '../../utils/UtilityFunctions'

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

    await this.master.shardToCluster(next)?.sendCommand('START_SHARD', { id: next })
      .catch(() => {
        this.master.log(`Shard ${next} failed to start in time. Continuing and will try again later.`)

        this.buckets[bucket]?.push(next)
      })

    if (this.buckets[bucket]?.length) await wait(5000)

    return await this.loop(bucket)
  }
}
