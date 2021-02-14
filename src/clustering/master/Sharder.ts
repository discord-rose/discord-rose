import Master from "./Master"

import { wait } from '../../utils/UtilityFunctions'

export class Sharder {
  public shards = []
  private looping: boolean = false

  constructor (public master: Master) {}

  register (id: number) {
    if (!this.shards.includes(id)) this.shards.push(id)

    if (!this.looping && this.master.spawned) this.loop()
  }

  async loop () {
    this.looping = true
    const next = this.shards.shift()
    if (typeof next === 'undefined') {
      this.looping = false
      return
    }

    await this.master.shardToCluster(next).sendCommand('START_SHARD', { id: next })
      .catch(() => {
        this.master.log(`Shard ${next} failed to start in time. Continuing and will try again later.`)

        this.shards.push(next)
      })

    await wait(5000)

    return this.loop()
  }
}