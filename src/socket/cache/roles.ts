import Collection from '@discordjs/collection'
import { APIRole } from 'discord-api-types'
import { Worker } from '../../clustering/worker/Worker'
import { CacheManager } from '../CacheManager'

export function roles (events: CacheManager, worker: Worker): void {
  worker.guildRoles = new Collection()

  events.on('GUILD_ROLE_CREATE', (r) => {
    const role = Object.assign({}, r)
    let guildRoles = worker.guildRoles.get(role.guild_id)
    if (!guildRoles) {
      guildRoles = new Collection()
      worker.guildRoles.set(role.guild_id, guildRoles)
    }

    if (worker.options.cacheControl.roles) {
      const newRole = {} as APIRole
      worker.options.cacheControl.roles.forEach(key => {
        newRole[key] = role.role[key] as never
      })
      newRole.id = role.role.id
      role.role = newRole
    }

    guildRoles.set(role.role.id, role.role)
  })

  events.on('GUILD_ROLE_UPDATE', (r) => {
    const role = r.role

    const guildRoles = worker.guildRoles.get(r.guild_id)
    if (!guildRoles) return
    const currentRole = guildRoles.get(role.id)
    if (!currentRole) return

    if (worker.options.cacheControl.roles) {
      worker.options.cacheControl.roles.forEach(key => {
        currentRole[key] = role[key] as never
      })
      currentRole.id = role.id
    } else {
      Object.keys(role).forEach(key => {
        currentRole[key] = role[key]
      })
    }

    guildRoles.set(currentRole.id, currentRole)
  })

  events.on('GUILD_ROLE_DELETE', (role) => {
    const guildRoles = worker.guildRoles.get(role.guild_id)

    guildRoles?.delete(role.role_id)
  })

  events.on('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return

    worker.guildRoles.delete(guild.id)
  })
}
