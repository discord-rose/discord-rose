import { APIGuild } from 'discord-api-types'
import { ThreadEvents, ResolveFunction } from '../ThreadComms'
import { Thread } from './Thread'

export const handlers: {
  [key in keyof ThreadEvents]?: (this: Thread, data: ThreadEvents[key]['send'], resolve: ResolveFunction<key>) => void | Promise<void>
} = {
  START: async function (data, respond) {
    this.worker.options = data.options

    await this.worker.start(data.shards)

    respond({})
  },
  START_SHARD: function (data) {
    const shard = this.worker.shards.get(data.id)
    shard?.start()
  },
  RESTART_SHARD: function ({ id }) {
    this.worker.shards.get(id)?.restart(true, 1002, 'Internally restarted')
  },
  GET_GUILD: function ({ id }, respond) {
    const guild = this.worker.guilds.get(id) as APIGuild
    if (!guild) respond({ error: 'Not in guild' })

    if (this.worker.guildRoles) {
      guild.roles = this.worker.guildRoles.get(guild.id)?.array() ?? []
    }
    if (this.worker.channels) {
      guild.channels = this.worker.channels.filter(x => x.guild_id === guild.id).array()
    }

    respond(guild)
  },
  EVAL: async function (code, respond) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const worker = this.worker
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
}
