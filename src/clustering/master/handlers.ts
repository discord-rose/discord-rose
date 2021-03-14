import { ThreadEvents, ResolveFunction } from '../ThreadComms'
import { Cluster } from './Cluster'

export default {
  REGISTER_SHARD: function ({ id }, respond) {
    this.master.sharder.register(id)
  
    this.logAs(`Registered shard ${id}`)
  
    respond({})
  },
  SHARD_READY: function ({ id }, _) {
    this.logAs(`Shard ${id} connected to Discord`)
  },
  LOG: function (data, _) {
    this.logAs(data)
  },
  RESTART_CLUSTER: function ({ id }, _) {
    this.master.clusters.get(String(id))?.restart()
  },
  RESTART_SHARD: function ({ id }, _) {
    this.master.shardToCluster(id)?.restartShard(id)
  },
  GET_GUILD: async function ({ id }, respond) {
    respond(await this.master.guildToCluster(id)?.getGuild(id) || { error: 'Not In Guild' })
  },
  BROADCAST_EVAL: async function (code, respond) {
    respond(await this.master.broadcastEval(code))
  },
  MASTER_EVAL: async function (code, respond) { 
    const master = this.master
    try {
      let ev = eval(code)
      if (ev.then) ev = await ev.catch((err: Error) => { error: err.message })
      // @ts-ignore eval can be any
      respond(ev)
    } catch (err) {
      // @ts-ignore eval can be any
      respond({ error: err.message })
    }
  },
  SEND_WEBHOOK: async function ({ id, token, data}, respond) {
    respond(await this.master.rest.webhooks.send(id, token, data))
  },
  STATS: async function (_, respond) {
    respond(await this.master.getStats())
  }
} as {
  [key in keyof ThreadEvents]: (this: Cluster, data: ThreadEvents[key]['send'], resolve: ResolveFunction<key>) => void | Promise<void>
}