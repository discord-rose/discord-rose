import { EventEmitter } from 'events'
import { Worker, MessagePort } from 'worker_threads'

import { generateID } from '../utils/UtilityFunctions'
import { CompleteBotOptions } from './master/Master'
import Collection from '@discordjs/collection'
import { APIGuild, APIMessage, Snowflake } from 'discord-api-types'
import { MessageTypes } from '../rest/resources/Messages'

enum ThreadMethod {
  COMMAND,
  RESPONSE,
  TELL
}

interface ThreadEvent {
  op: ThreadMethod
  i: string
  e: keyof ThreadEvents
  d: any
}

export enum State {
  DISCONNECTED = 0,
  CONNECTING,
  CONNECTED
}

interface ShardStats {
  id: number
  ping: number
  state: State
  guilds: number
}

export interface ClusterStats {
  cluster: {
    memory: number
    uptime: number
    id: string
  }
  shards: ShardStats[]
}

export interface ThreadEvents {
  '*': {
    send: {
      event: keyof ThreadEvents
      d: any
    }
    receive: any
  }
  START: {
    send: {
      shards: number[]
      options: CompleteBotOptions
    }
    receive: {}
  }
  KILL: {
    send: null
    receive: null
  }
  REGISTER_SHARD: {
    send: {
      id: number
    }
    receive: {}
  }
  START_SHARD: {
    send: {
      id: number
    }
    receive: null
  }
  SHARD_READY: {
    send: {
      id: number
    }
    receive: null
  }
  LOG: {
    send: string
    receive: null
  }
  RESTART_CLUSTER: {
    send: {
      id: any
    }
    receive: null
  }
  RESTART_SHARD: {
    send: {
      id: number
    }
    receive: null
  }
  GET_GUILD: {
    send: {
      id: Snowflake
    }
    receive: APIGuild
  }
  EVAL: {
    send: string
    receive: any
  }
  BROADCAST_EVAL: {
    send: string
    receive: any[]
  }
  MASTER_EVAL: {
    send: string
    receive: any
  }
  SEND_WEBHOOK: {
    send: {
      id: Snowflake
      token: string
      data: MessageTypes
    }
    receive: APIMessage
  }
  GET_STATS: {
    send: null
    receive: ClusterStats
  }
  STATS: {
    send: null
    receive: ClusterStats[]
  }
}

export type ResolveFunction<K extends keyof ThreadEvents> = ThreadEvents[K]['receive'] extends null ? null : (data: ThreadEvents[K]['receive'] | { error: string }) => void

export class ThreadComms extends EventEmitter {
  private comms?: Worker | MessagePort | null = null
  private readonly commands: Collection<string, (value?: any) => void> = new Collection()

  on: <K extends keyof ThreadEvents>(event: K, listener: (data: ThreadEvents[K]['send'], resolve: ResolveFunction<K>) => void) => this = this.on

  emit<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send'], resolve: ResolveFunction<K>): boolean {
    super.emit('*', { event, d: data }, resolve)
    return super.emit(event, data, resolve)
  }

  register (comms: Worker | MessagePort): void {
    this.comms = comms

    this.comms.on('message', (msg: ThreadEvent) => {
      switch (msg.op) {
        case ThreadMethod.COMMAND: {
          this.emit(msg.e, msg.d, (data) => {
            this._respond(msg.i, data)
          })
          break
        }
        case ThreadMethod.RESPONSE: {
          const command = this.commands.get(msg.i)
          if (!command) return
          this.commands.delete(msg.i)

          command(msg.d)
          break
        }
        case ThreadMethod.TELL: {
          this.emit(msg.e, msg.d, null)
          break
        }
      }
    })

    this.on('KILL', () => process.exit(5))
  }

  private _send (op: number, e: string | null, i: string | null, d?: any): void {
    this.comms?.postMessage({
      op,
      e,
      i,
      d
    })
  }

  public async sendCommand<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): Promise<ThreadEvents[K]['receive']> {
    return await new Promise((resolve, reject) => {
      const id = generateID(this.commands.keyArray())
      this.commands.set(id, (dat) => {
        if (dat?.error) resolve(new Error(dat.error))

        resolve(dat)
      })

      this._send(ThreadMethod.COMMAND, event, id, data)

      setTimeout(() => {
        if (this.commands.has(id)) {
          this.commands.delete(id)
          reject(new Error(`Didn't respond in time to COMMAND ${event}`))
        }
      }, 15e3)
    })
  }

  private _respond (id: string, data: any): void {
    this._send(ThreadMethod.RESPONSE, null, id, data)
  }

  public tell<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): void {
    this._send(ThreadMethod.TELL, event, null, data)
  }
}
