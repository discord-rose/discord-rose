import { CacheManager } from '../../../socket/CacheManager'
import { Worker } from '../Worker'

import { formatBotOptions } from '../../../utils/formatBotOptions'
import { RestManager } from '../../../rest/Manager'
import { Shard } from '../../../socket/Shard'

import { SingleSharder } from './SingleSharder'
import { SingleThread } from './SingleThread'
import { BotOptions } from '../../../typings/options'

export class SingleWorker extends Worker<{ DEBUG: string }> {
  cacheManager: CacheManager
  sharder = new SingleSharder(this)

  comms = new SingleThread(this)

  constructor (options: BotOptions) {
    super(false)

    this.options = formatBotOptions(options)
    this.cacheManager = new CacheManager(this)
    this.api = new RestManager(this.options.token)

    const timeStart = Date.now()

    this.once('READY', () => {
      this.log(`Finished spawning after ${((Date.now() - timeStart) / 1000).toFixed(2)}s`)
    })

    this.log = typeof options.log === 'undefined'
      ? (msg: string, _cluster) => {
          console.log(`Singleton | ${msg}`)
        }
      : options.log as () => {}
    if (!this.log) this.log = () => {}

    void this._beginSingleton()
  }

  async _beginSingleton (): Promise<void> {
    const gatewayRequest = await this.api.misc.getGateway()

    this.options.ws = gatewayRequest.url

    if ((this.options.shards as unknown as string) === 'auto') {
      this.options.shards = gatewayRequest.shards
    }

    void this.start()
  }

  async _waitForShard (shard: Shard): Promise<{ err: boolean }> {
    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error())
      }, 15e3)

      const done = (): void => {
        clearTimeout(timeout)
        shard.off('READY', readyFn)
        shard.off('CLOSED', closedFn)
      }

      const readyFn = (): void => {
        resolve({ err: false })
        done()
      }
      const closedFn = (_code: number, _reason: string): void => {
        resolve({ err: true })
        done()
      }

      shard.on('READY', readyFn)
      shard.on('CLOSED', closedFn)
    })
  }

  async start (): Promise<void> {
    this.log(`Connecting ${this.options.shards} shard${this.options.shards > 1 ? 's' : ''}`)
    for (let i = 0; i < this.options.shards; i++) {
      const shard = new Shard(i, this)
      this.shards.set(i, shard)
      await shard.register()
    }
  }

  debug (msg): void {
    this.emit('DEBUG', msg)
  }
}
