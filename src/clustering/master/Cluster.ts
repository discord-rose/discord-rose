import Master from "./Master";
import { Worker } from 'worker_threads'
import { ThreadComms, ThreadEvents, ResolveFunction } from "../ThreadComms";
import { Snowflake } from "discord-api-types";

import handlers from './handlers'

export class Cluster extends ThreadComms {
  private thread?: Worker
  private started = false

  public dying = false

  constructor (public id: string, public master: Master) {
    super()

    const keys = Object.keys(handlers)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof ThreadEvents

      this.on(key, handlers[key].bind(this) as (data: ThreadEvents[typeof key]['send'], resolve: ResolveFunction<typeof key>) => void)
    }
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
