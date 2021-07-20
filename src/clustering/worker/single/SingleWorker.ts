import { CacheManager } from '../../../socket/CacheManager'
import { BotOptions } from '../../master/Master'
import { Worker } from '../Worker'

import { formatBotOptions } from '../../../utils/formatBotOptions'
import { RestManager } from '../../../rest/Manager'
import { Shard } from '../../../socket/Shard'
// import { Thread } from '../Thread'

import { SingleSharder } from './SingleSharder'
import { SingleThread } from './SingleThread'

export class SingleWorker extends Worker {
  cacheManager: CacheManager
  sharder = new SingleSharder(this)

  comms = new SingleThread(this)

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  // comms = {
  //   id: '0',
  //   tell: (event: string, data: any) => {
  //     if (event === 'LOG') this.log(data)
  //     if (event === 'SHARD_READY') this.log(`Shard ${data.id as string} connected to Discord`)
  //   },
  //   registerShard: (id) => {
  //     this.sharder.register(id)
  //   }
  // } as Thread

  constructor (options: BotOptions) {
    super(false)

    this.options = formatBotOptions(options)
    this.cacheManager = new CacheManager(this)
    this.api = new RestManager(this.options.token)

    const timeStart = Date.now()

    this.once('READY', () => {
      this.log(`Finished spawning after ${((Date.now() - timeStart) / 1000).toFixed(2)}s`)
    })

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

  async _waitForShard (shard: Shard): Promise<void> {
    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error())
      }, 15e3)

      shard.once('READY', () => {
        clearTimeout(timeout)

        resolve()
      })
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

  log (msg): void {
    console.log(msg)
  }

  debug (msg): void {}
}
