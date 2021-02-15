import Master from "./Master";
import { Worker } from 'worker_threads'
import { ThreadComms } from "../ThreadComms";
import { Snowflake } from "discord-api-types";

export class Cluster extends ThreadComms {
  private thread: Worker
  private started = false

  public dying = false

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
    this.on('LOG', (data) => {
      this.master.log(data)
    })
    this.on('RESTART_CLUSTER', ({ id }) => {
      this.master.clusters.get(String(id))?.restart()
    })
    this.on('RESTART_SHARD', ({ id }) => {
      this.master.shardToCluster(id)?.restartShard(id)
    })
    this.on('GET_GUILD', async ({ id }, respond) => {
      respond(await this.master.guildToCluster(id)?.getGuild(id))
    })
    this.on('BROADCAST_EVAL', async (code, respond) => {
      respond(await this.master.broadcastEval(code))
    })
    this.on('MASTER_EVAL', async (code, respond) => {
      const master = this.master
      try {
        let ev = eval(code)
        if (ev.then) ev = await ev.catch(err => { error: err.message })
        respond(ev)
      } catch (err) {
        respond({ error: err.message })
      }
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
      shards: this.master.chunks[this.id],
      options: this.master.options
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
