import { APIGuild } from 'discord-api-types'
import { ThreadEvents, ResolveFunction } from '../ThreadComms'
import { Thread } from './Thread'

export default {
  START: async function (data, respond) {
    this.worker.options = data.options
  
    await this.worker.start(data.shards)
  
    respond({})
  },
  START_SHARD: async function (data, respond) {
    const shard = this.worker.shards.get(data.id)
    if (!shard) {
      respond({ error: 'Shard doesn\'t exist' })
      return
    }
    await shard.start()
    respond({})
  },
  RESTART_SHARD: function ({ id }, respond) {
    this.worker.shards.get(id)?.restart(true, 1000, 'Internally restarted')
  },
  GET_GUILD: function ({ id }, respond) {
    const guild = this.worker.guilds.get(id) as APIGuild
    if (!guild) respond({ error: 'Not in guild' })
  
    if (this.worker.guildRoles) {
      guild.roles = this.worker.guildRoles.get(guild.id)?.array() || []
    }
    if (this.worker.channels) {
      guild.channels = this.worker.channels.filter(x => x.guild_id === guild.id).array()
    }
  
    respond(guild)
  },
  EVAL: async function (code, respond) {
    const worker = this.worker
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
  GET_STATS: function (_, respond) {
    respond({
      cluster: {
        id: this.id,
        memory: process.memoryUsage().heapTotal,
        uptime: process.uptime()
      },
      shards: this.worker.shards.map(x => ({
        id: x.id,
        ping: x.ping,
        guilds: this.worker.guilds.filter?.(guild => this.worker.guildShard(guild.id).id === x.id).size,
        state: x.state
      }))
    })
  }
} as {
  [key in keyof ThreadEvents]: (this: Thread, data: ThreadEvents[key]['send'], resolve: ResolveFunction<key>) => void | Promise<void>
}