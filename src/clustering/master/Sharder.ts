import { Master } from "./Master"

import { wait } from '../../utils/UtilityFunctions'

export class Sharder {
  public shards: number[] = []
  private looping: boolean = false

  constructor (public master: Master) {}

  register (id: number) {
    if (!this.shards.includes(id)) this.shards.push(id)

    if (!this.looping && this.master.spawned) this.loop()
  }

  async loop (): Promise<void> {
    this.looping = true
    const next = []

    for (var i = 0; i < this.master.session.max_concurrency; i++) {
      const n = this.shards.shift()
      if (typeof n !== 'undefined') next.push(n)
    }

    if (typeof next[0] === 'undefined') {
      this.looping = false
      return
    }

    await Promise.all(next.map(x => this.master.shardToCluster(x)?.sendCommand('START_SHARD', { id: x })
      .catch(() => {
        this.master.log(`Shard ${next} failed to start in time. Continuing and will try again later.`)

        this.shards.push(x)
      })))

    await wait(5000)

    return this.loop()
  }
}