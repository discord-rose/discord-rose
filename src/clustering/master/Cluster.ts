import { Master } from './Master'
import { Worker } from 'worker_threads'
import { ThreadComms } from '../ThreadComms'
import { APIGuild, Snowflake } from 'discord-api-types'

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

  public async spawn (): Promise<void> {
    if (this.custom) {
      this.started = true
    }
    return void new Promise(resolve => {
      this.thread = new Worker(this.fileName, {
        workerData: {
          id: this.id,
          custom: this.custom
        }
      })

      super.register(this.thread)

      this.thread.on('exit', (code) => {
        this.started = false
        this.logAs(`Closed with code ${code}`)
        this.master.emit('CLUSTER_STOPPED', this)
        if (!this.dying) void this.spawn()
      })
      this.thread.on('online', () => {
        if (this.master.spawned) void this.start()

        this.logAs('Started')
        this.master.emit('CLUSTER_STARTED', this)

        resolve(true)
      })
    })
  }

  async start (): Promise<{}|undefined> {
    if (this.custom) return
    this.started = true
    return await this.sendCommand('START', {
      shards: this.master.chunks[Number(this.id)],
      options: JSON.parse(JSON.stringify(this.master.options)) // normalize options
    })
  }

  public logAs (msg: string): void {
    this.master.log(msg, this)
  }

  /**
   * Restarts the cluster
   */
  restart (): void {
    this.dying = false

    this.tell('KILL', null)
  }

  /**
   * Kills cluster without restarting
   */
  kill (): void {
    this.dying = true

    this.tell('KILL', null)
  }

  /**
   * Restarts a shard
   * @param id ID of shard to restart
   */
  restartShard (id: number): void {
    this.tell('RESTART_SHARD', { id })
  }

  /**
   * Gets a guild from the clusters cache
   * @param id ID of guild
   */
  async getGuild (id: Snowflake): Promise<APIGuild> {
    return await this.sendCommand('GET_GUILD', { id })
  }

  /**
   * Evals code on the cluster
   * @param code Code to eval
   */
  async eval (code: string): Promise<any[]> {
    return await this.sendCommand('EVAL', code)
  }
}
