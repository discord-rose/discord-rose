import { APIGuild, APIMessage, Snowflake } from 'discord-api-types'
import { workerData, parentPort, MessagePort } from 'worker_threads'
import { MessageTypes, MessagesResource } from '../../rest/resources/Messages'
import { Worker } from '../../typings/lib'

import { ClusterStats, ThreadComms, ThreadEvents } from '../ThreadComms'

import { inspect } from 'util'

import { handlers } from './handlers'

/**
 * Thread interface for interacting with the master process from a worker
 */
export class Thread extends ThreadComms {
  public id: string = workerData.id

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  constructor (public worker: Worker = {} as Worker) {
    super()
    super.register(parentPort as MessagePort)

    const keys = Object.keys(handlers)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof ThreadEvents

      this.on(key, (data, resolve) => {
        handlers[key]?.bind(this)(data, resolve)
      })
    }
  }

  async registerShard (id: number): Promise<{}> {
    return await this.sendCommand('REGISTER_SHARD', { id })
  }

  /**
   * Destroys entire master.
   */
  destroy (): void {
    void this.sendCommand('KILL', null)
  }

  /**
   * Logs data to master's MasterOptions.log
   * @param message Message args
   */
  log (...messages: any[]): void {
    this.tell('LOG', messages.map(m => typeof m === 'string' ? m : inspect(m)).join(' '))
  }

  /**
   * Restarts a specific cluster
   * @param clusterId ID of cluster
   */
  async restartCluster (clusterId: string): Promise<null> {
    return await this.sendCommand('RESTART_CLUSTER', { id: clusterId })
  }

  /**
   * Restarts a specific shard
   * @param shardId ID of shard
   */
  restartShard (shardId: any): void {
    return this.tell('RESTART_SHARD', { id: shardId })
  }

  /**
   * Gets a cached guild across clusters
   * @param guildId ID of guild
   * @returns The guild
   */
  async getGuild (guildId: Snowflake): Promise<APIGuild> {
    return await this.sendCommand('GET_GUILD', { id: guildId })
  }

  /**
   * Eval code on every cluster
   * @param code Code to eval
   * @returns Response
   */
  async broadcastEval (code: string): Promise<any[]> {
    return await this.sendCommand('BROADCAST_EVAL', code)
  }

  /**
   * Evals code on the master process
   * @param code Code to eval
   * @returns Response
   */
  async masterEval (code: string): Promise<any> {
    return await this.sendCommand('MASTER_EVAL', code)
  }

  /**
   * Sends a webhook using the master process, useful for respecting ratelimits
   * @param webhookId ID of webhook
   * @param token Token of webhook
   * @param data Data for message
   * @returns Message sent
   */
  async sendWebhook (webhookId: Snowflake, token: string, data: MessageTypes): Promise<APIMessage> {
    return await this.sendCommand('SEND_WEBHOOK', { id: webhookId, token, data: MessagesResource._formMessage(data, true) })
  }

  /**
   * Gets an array of each clusters stats
   * @returns Stats
   */
  async getStats (): Promise<ClusterStats[]> {
    return await this.sendCommand('STATS', null)
  }
}
