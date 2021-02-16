import { APIGuild, Snowflake } from 'discord-api-types';
import { workerData, parentPort } from 'worker_threads'
import { MessageTypes } from '../../rest/resources/Messages';
import { Worker } from "../../typings/lib"

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
    this.on('START_SHARD', async (event, respond) => {
      const shard = this.worker.shards.get(event.id)
      if (!shard) console.error('Shard doesn\'t exist.')
      await shard.start()
      respond({})
    })
    this.on('RESTART_SHARD', ({ id }) => {
      this.worker.shards.get(id)?.restart(true, 1000, 'Internally restarted')
    })
    this.on('GET_GUILD', ({ id }, respond) => {
      const guild = this.worker.guilds.get(id) as APIGuild
      if (!guild) respond({ error: 'Not in guild' })

      if (this.worker.guildRoles) {
        guild.roles = this.worker.guildRoles.get(guild.id).array()
      }
      if (this.worker.channels) {
        guild.channels = this.worker.channels.filter(x => x.guild_id === guild.id).array()
      }

      respond(guild)
    })
    this.on('EVAL', async (code, respond) => {
      const worker = this.worker
      try {
        let ev = eval(code)
        if (ev.then) ev = await ev.catch(err => { error: err.message })
        respond(ev)
      } catch (err) {
        respond({ error: err.message })
      }
    })
  }

  async registerShard (id: number) {
    return this.sendCommand('REGISTER_SHARD', { id })
  }

  /**
   * Destroys entire master.
   */
  destroy () {
    this.sendCommand('KILL', null)
  }

  /**
   * Logs data to master's MasterOptions.log
   * @param message Message string
   */
  log (message: string) {
    this.tell('LOG', message)
  }

  /**
   * Restarts a specific cluster
   * @param id ID of cluster
   */
  restartCluster (id: any) {
    return this.sendCommand('RESTART_CLUSTER', { id })
  }

  /**
   * Restarts a specific shard
   * @param id ID of shard
   */
  restartShard (id: any) {
    return this.tell('RESTART_SHARD', { id })
  }

  /**
   * Gets a cached guild across clusters
   * @param id ID of guild
   */
  getGuild (id: Snowflake) {
    return this.sendCommand('GET_GUILD', { id })
  }

  /**
   * Eval code on every cluster
   * @param code Code to eval
   */
  broadcastEval (code: string) {
    return this.sendCommand('BROADCAST_EVAL', code)
  }

  /**
   * Evals code on the master process
   * @param code Code to eval
   */
  masterEval (code: string) {
    return this.sendCommand('MASTER_EVAL', code)
  }

  /**
   * Sends a webhook using the master process, useful for respecting ratelimits
   * @param id ID of webhook
   * @param token Token of webhook
   * @param data Data for message
   */
  sendWebhook (id: Snowflake, token: string, data: MessageTypes) {
    return this.sendCommand('SEND_WEBHOOK', { id, token, data })
  }
}
