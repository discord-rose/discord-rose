import { Master } from "./Master";
import { Worker } from 'worker_threads'
import { ThreadComms } from "../ThreadComms";
import { Snowflake } from "discord-api-types";

export class Cluster extends ThreadComms {
  private thread?: Worker
  private started = false

  public dying = false

  constructor (public id: string, public master: Master, public fileName = master.fileName, public custom: boolean = false) {
    super()

    this.on('*', (data, respond) => {
      this.master.handlers.emit(data.event, this, data.d, respond)
    })
  }

  public spawn (): Promise<void> {
    if (this.custom) {
      this.started = true
    }
    return new Promise(resolve => {
      this.master.log(`Starting cluster ${this.id}`)
      this.thread = new Worker(this.fileName, {
        workerData: {
          id: this.id,
          custom: this.custom
        }
      })

      super.register(this.thread)
    
      this.thread.on('exit', (code) => {
        this.master.log(`Cluster ${this.id} closed with code ${code}`)
        if (!this.dying) this.spawn()
      })
      this.thread.on('online', () => {
        this.master.log(`Cluster ${this.id} started.`)
        resolve()

        if (this.started) this.start()
      })
    })
  }

  start () {
    if (this.custom) return
    this.started = true
    return this.sendCommand('START', {
      shards: this.master.chunks[Number(this.id)],
      options: JSON.parse(JSON.stringify(this.master.options)) // normalize options
    })
  }

  /**
   * Restarts the cluster
   */
  restart () {
    this.dying = false

    this.tell('KILL', null)
  }

  /**
   * Kills cluster without restarting
   */
  kill () {
    this.dying = true

    this.tell('KILL', null)
  }

  /**
   * Restarts a shard
   * @param id ID of shard to restart
   */
  restartShard (id: number) {
    this.tell('RESTART_SHARD', { id })
  }

  /**
   * Gets a guild from the clusters cache
   * @param id ID of guild
   */
  getGuild (id: Snowflake) {
    return this.sendCommand('GET_GUILD', { id })
  }

  /**
   * Evals code on the cluster
   * @param code Code to eval
   */
  eval (code: string) {
    return this.sendCommand('EVAL', code)
  }
}
