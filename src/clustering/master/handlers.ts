import { ThreadEvents, ResolveFunction } from '../ThreadComms'
import { Cluster } from './Cluster'

import { wait } from '../../utils/UtilityFunctions'

export const handlers: {
  [key in keyof ThreadEvents]?: (this: Cluster, data: ThreadEvents[key]['send'], resolve: ResolveFunction<key>) => void | Promise<void>
} = {
  REGISTER_SHARD: function ({ id }, respond) {
    this.master.sharder.register(id)

    this.master.debug(`Cluster ${this.id} registered shard ${id}`)

    respond({})
  },
  SHARD_READY: async function ({ id }, _) {
    this.logAs(`Shard ${id} connected to Discord`)
    if (!this.master.spawned) {
      await wait(6000)
      if (this.master.sharder.buckets.every(x => x === null)) this.master.emit('READY', this.master)
    }
  },
  LOG: function (data, _) {
    this.logAs(data)
  },
  DEBUG: function (msg) {
    this.master.debug(msg)
  },
  RESTART_CLUSTER: function ({ id }, _) {
    this.master.processes.get(String(id))?.restart()
  },
  RESTART_SHARD: function ({ id }, _) {
    this.master.shardToCluster(id)?.restartShard(id)
  },
  GET_GUILD: async function ({ id }, respond) {
    respond(await this.master.guildToCluster(id)?.getGuild(id) ?? { error: 'Not In Guild' })
  },
  BROADCAST_EVAL: async function (code, respond) {
    respond(await this.master.broadcastEval(code))
  },
  MASTER_EVAL: async function (code, respond) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const master = this.master
    try {
      // eslint-disable-next-line no-eval
      let ev = eval(code)
      if (ev.then) ev = await ev.catch((err: Error) => ({ error: err.message }))
      // @ts-expect-error eval can be any
      respond(ev)
    } catch (err) {
      // @ts-expect-error eval can be any
      respond({ error: err.message })
    }
  },
  SEND_WEBHOOK: async function ({ id, token, data }, respond) {
    respond(await this.master.rest.webhooks.send(id, token, data))
  },
  STATS: async function (_, respond) {
    respond(await this.master.getStats())
  }
}
