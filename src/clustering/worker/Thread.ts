import { workerData, parentPort } from 'worker_threads'
import Worker from './Worker';

import { ThreadComms } from "../ThreadComms";

export class Thread extends ThreadComms {
  public id: string = workerData.id

  constructor (private worker: Worker) {
    super()
    super.register(parentPort)

    this.on('START', async (event, respond) => {
      this.worker.options = event.options

      await this.worker.start(event.shards)

      respond({})
    })
    this.on('START_SHARD', (event, respond) => {
      this.startShard(event.id, respond)
    })
  }

  async registerShard (id: number) {
    return this.sendCommand('REGISTER_SHARD', { id })
  }

  async startShard (id: number, respond: (data: {}) => void) {
    const shard = this.worker.shards.get(id)
    if (!shard) console.error('Shard doesn\'t exist.')
    await shard.start()
    respond({})
  }
}