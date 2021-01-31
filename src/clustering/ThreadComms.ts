import { EventEmitter } from "events";
import { Worker, MessagePort } from 'worker_threads'

import { generateID } from '../utils/UtilityFunctions'
import { BotOptions } from "./master/Master";
import Collection from '@discordjs/collection'

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

interface ThreadEvents {
  START: {
    send: {
      shards: number[]
      options: BotOptions
    }
    receive: {}
  }
  KILL: {
    send: null,
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
    },
    receive: {}
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
}

export class ThreadComms extends EventEmitter {
  private comms?: Worker | MessagePort = null
  private commands: Collection<string, (value?: any) => void> = new Collection()

  
  on: <K extends keyof ThreadEvents>(event: K, listener: (data: ThreadEvents[K]['send'], resolve?: (data: ThreadEvents[K]['receive']) => void) => void) => this

  emit<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send'], resolve?: (data: ThreadEvents[K]['receive']) => void): boolean {
    super.emit('*', event, data, resolve)
    return super.emit(event, data, resolve)
  }

  register (comms: Worker | MessagePort) {
    this.comms = comms

    this.comms.on('message', (msg: ThreadEvent) => {
      switch (msg.op) {
        case ThreadMethod.COMMAND: {
          this.emit(msg.e, msg.d, (data) => {
            this.respond(msg.i, data)
          })
          break
        }
        case ThreadMethod.RESPONSE: {
          const command = this.commands.get(msg.i)
          if (!command) return
          command(msg.d)
          break
        }
        case ThreadMethod.TELL: {
          this.emit(msg.e, msg.d)
          break
        }
      }
    })

    this.on('KILL', () => process.exit(5))
  }

  private _send (op, e, i, d) {
    this.comms.postMessage({
      op,
      e,
      i,
      d
    })
  }

  public async sendCommand<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): Promise<ThreadEvents[K]['receive']> {
    return new Promise((resolve, reject) => {
      const id = generateID(this.commands.keyArray())
      this.commands.set(id, resolve)

      this._send(ThreadMethod.COMMAND, event, id, data)

      setTimeout(() => {
        if (this.commands.has(id)) {
          this.commands.delete(id)
          reject(new Error(`Didn't respond in time to COMMAND ${event}`))
        }
      }, 15e3)
    })
  }

  public respond (id: string, data: any) {
    this._send(ThreadMethod.RESPONSE, null, id, data)
  }

  public tell<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): void {
    this._send(ThreadMethod.TELL, event, null, data)
  }
}