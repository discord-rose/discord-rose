import { CacheManager } from '../../../socket/CacheManager'
import { BotOptions } from '../../master/Master'
import { Worker } from '../Worker'

import { formatBotOptions } from '../../../utils/formatBotOptions'
import { RestManager } from '../../../rest/Manager'
import { Shard } from '../../../socket/Shard'
import { Thread } from '../Thread'

import { SingleSharder } from './SingleSharder'

export class SingleWorker extends Worker {
  cacheManager: CacheManager
  sharder = new SingleSharder(this)

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  comms = {
    id: '0',
    tell: (event: string, data: any) => {
      if (event === 'LOG') this.log(data)
      if (event === 'SHARD_READY') this.log(`Shard ${data.id as string} connected to Discord`)
    },
    registerShard: (id) => {
      this.sharder.register(id)
    }
  } as Thread

  constructor (options: BotOptions) {
    super(false)

    this.options = formatBotOptions(options)
    this.cacheManager = new CacheManager(this)
    this.api = new RestManager(this.options.token)

    this.once('READY', () => {
      this.log('All shards ready')
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
    return await new Promise((resolve) => {
      shard.once('READY', () => resolve())
    })
  }

  async start (): Promise<void> {
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
