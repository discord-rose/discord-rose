import Master from "./Master";
import { Worker } from 'worker_threads'
import { ThreadComms } from "../ThreadComms";

export class Cluster extends ThreadComms {
  private master: Master
  private thread: Worker

  public id: string

  constructor (id: string, master: Master) {
    super()
    this.id = id
    this.master = master
  }

  public start (): Promise<void> {
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
        this.start()
      })

      this.thread.on('error', (err) => {
        this.master.log(`Error on cluster ${this.id}; ${err}`)
      })
      this.thread.on('online', () => {
        this.master.log(`Cluster ${this.id} started.`)
        resolve()
      })
    })
  }
}
