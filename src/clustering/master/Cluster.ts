import Master from "./Master";
import { Worker } from 'worker_threads'
import { ThreadComms } from "../ThreadComms";

export class Cluster extends ThreadComms {
  private thread: Worker
  private started = false

  constructor (public id: string, private master: Master) {
    super()

    this.on('REGISTER_SHARD', ({ id }, respond) => {
      this.master.sharder.register(id)

      this.master.log(`Cluster ${this.id} registered shard ${id}`)

      respond({})
    })
    this.on('SHARD_READY', ({ id }) => {
      this.master.log(`Shard ${id} connected to Discord.`)
    })
  }

  public spawn (): Promise<void> {
    return new Promise(resolve => {
      this.master.log(`Starting cluster ${this.id}`)
      this.thread = new Worker(this.master.fileName, {
        workerData: {
          id: this.id
        }
      })

      super.register(this.thread)
    
      this.thread.on('exit', (code) => {
        this.master.log(`Cluster ${this.id} closed with code ${code}`)
        this.spawn()
      })

      this.thread.on('error', (err) => {
        this.master.log(`Error on cluster ${this.id}; ${err}`)
      })
      this.thread.on('online', () => {
        this.master.log(`Cluster ${this.id} started.`)
        resolve()

        if (this.started) this.start()
      })
    })
  }

  start () {
    this.started = true
    return this.sendCommand('START', {
      shards: this.master.chunks[this.id],
      options: this.master.options
    })
  }
}
