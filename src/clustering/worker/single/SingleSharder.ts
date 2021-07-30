import { wait } from '../../../utils/UtilityFunctions'
import { SingleWorker } from './SingleWorker'

/**
 * Sharder in charge of handling shard spawn ratelimtis
 */
export class SingleSharder {
  public buckets: Array<number[]|null> = []

  constructor (public worker: SingleWorker) {}

  register (id: number): void {
    const bucket = id % 1

    let running = true

    if (!this.buckets[bucket]) {
      running = false
      this.buckets[bucket] = []
    }

    if (!this.buckets[bucket]?.includes(id)) {
      this.buckets[bucket]?.push(id)
    }

    this.buckets[bucket] = this.buckets[bucket]?.sort((a, b) => a - b) as number[]

    if (!running) void this.loop(bucket)
  }

  async loop (bucket: number): Promise<void> {
    this.worker.debug(`Looping bucket #${bucket}`)
    if (!this.buckets[bucket]) return
    const next = this.buckets[bucket]?.shift()

    if (next === undefined) {
      this.buckets[bucket] = null
      this.worker.debug(`Reached end of bucket #${bucket}`)
      return
    }

    const nextShard = this.worker.shards.get(next)
    let waiting = false
    if (nextShard) {
      nextShard.start()
      waiting = await this.worker._waitForShard(nextShard)
        .then(res => {
          return !res.err
        })
        .catch(() => {
          this.worker.log(`Shard ${next} failed to startup in time. Continuing.`)
          return true
        })
    }

    if (waiting) await wait(this.worker.options.spawnTimeout)
    else await wait(500)

    return await this.loop(bucket)
  }
}
