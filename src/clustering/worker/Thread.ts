import { Snowflake } from 'discord-api-types';
import { workerData, parentPort, MessagePort } from 'worker_threads'
import { MessageTypes, MessagesResource } from '../../rest/resources/Messages';
import { Worker } from "../../typings/lib"

import { ResolveFunction, ThreadComms, ThreadEvents } from "../ThreadComms";

import handlers from './handlers'

export class Thread extends ThreadComms {
  public id: string = workerData.id

  constructor (public worker: Worker) {
    super()
    super.register(parentPort as MessagePort)

    const keys = Object.keys(handlers)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof ThreadEvents

      this.on(key, handlers[key].bind(this) as (data: ThreadEvents[typeof key]['send'], resolve: ResolveFunction<typeof key>) => void)
    }
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
   * @param clusterId ID of cluster
   */
  restartCluster (clusterId: any) {
    return this.sendCommand('RESTART_CLUSTER', { id: clusterId })
  }

  /**
   * Restarts a specific shard
   * @param shardId ID of shard
   */
  restartShard (shardId: any) {
    return this.tell('RESTART_SHARD', { id: shardId })
  }

  /**
   * Gets a cached guild across clusters
   * @param guildId ID of guild
   */
  getGuild (guildId: Snowflake) {
    return this.sendCommand('GET_GUILD', { id: guildId })
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
   * @param webhookId ID of webhook
   * @param token Token of webhook
   * @param data Data for message
   */
  sendWebhook (webhookId: Snowflake, token: string, data: MessageTypes) {
    return this.sendCommand('SEND_WEBHOOK', { id: webhookId, token, data: MessagesResource._formMessage(data, true) })
  }

  /**
   * Gets an array of each clusters stats
   */
  getStats () {
    return this.sendCommand('STATS', null)  
  }
}
