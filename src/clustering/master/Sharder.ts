import Collection from "@discordjs/collection";
import Master from "./Master";

import { wait } from '../../utils/UtilityFunctions'

export class Sharder {
  public shards: Collection<number, number> = new Collection()
  private looping: boolean = false

  constructor (public master: Master) {}

  register (id: number) {
    this.shards.set(id, id)

    if (!this.looping && this.master.spawned) this.loop()
  }

  async loop () {
    this.looping = true
    const next = this.shards.first()
    if (typeof next === 'undefined') {
      this.looping = false
      return
    }

    await this.master.shardToCluster(next).sendCommand('START_SHARD', { id: next })

    this.shards.delete(next)

    await wait(5000)

    return this.loop()
  }
}