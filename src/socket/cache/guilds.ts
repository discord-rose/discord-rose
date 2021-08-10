import Collection from '@discordjs/collection'
import { Worker } from '../../clustering/worker/Worker'
import { CacheManager } from '../CacheManager'

import { APIGuild, GatewayGuildMemberAddDispatchData } from 'discord-api-types'

export function guilds (events: CacheManager, worker: Worker): void {
  worker.guilds = new Collection()

  events.on('GUILD_CREATE', (g) => {
    let guild = Object.assign({}, g)
    guild.members?.forEach(member => {
      // @ts-expect-error For proper cache formatting
      member.guild_id = guild.id
      events.emit('GUILD_MEMBER_ADD', member as GatewayGuildMemberAddDispatchData)
    })
    delete guild.members

    guild.channels?.forEach(channel => {
      channel.guild_id = guild.id
      events.emit('CHANNEL_CREATE', channel)
    })
    delete guild.channels

    guild.roles.forEach(role => {
      events.emit('GUILD_ROLE_CREATE', { guild_id: guild.id, role })
    })
    guild.roles = []
    delete guild.presences

    if (worker.options.cacheControl.guilds) {
      const newGuild = {} as APIGuild
      worker.options.cacheControl.guilds.forEach(key => {
        newGuild[key] = guild[key] as never
      })
      newGuild.id = guild.id
      guild = newGuild
    }

    worker.guilds.set(guild.id, guild)
  })

  events.on('GUILD_UPDATE', (guild) => {
    const currentGuild = worker.guilds.get(guild.id)
    if (!currentGuild) return

    if (worker.options.cacheControl.guilds) {
      worker.options.cacheControl.guilds.forEach(key => {
        currentGuild[key] = guild[key] as never
      })
      currentGuild.id = guild.id
    } else {
      Object.keys(guild).forEach(key => {
        currentGuild[key] = guild[key]
      })
    }

    worker.guilds.set(guild.id, currentGuild)
  })

  events.on('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return

    worker.guilds.delete(guild.id)
  })
}
