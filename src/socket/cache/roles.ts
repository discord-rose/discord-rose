import Collection from '@discordjs/collection';
import { APIRole } from 'discord-api-types';
import Worker from '../../clustering/worker/Worker';
import { CacheManager } from '../CacheManager';

export function roles (events: CacheManager, worker: Worker) {
  worker.guildRoles = new Collection()

  events.add('GUILD_ROLE_CREATE', (role) => {
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

  events.add('GUILD_ROLE_UPDATE', (role) => {
    const guildRoles = worker.guildRoles.get(role.guild_id)
    if (!guildRoles) return
    let currentRole = guildRoles.get(role.role.id)
    if (!currentRole) return
    
    currentRole.name = role.role.name
    currentRole.permissions = role.role.permissions
    currentRole.color = role.role.color
    currentRole.hoist = role.role.hoist
    currentRole.mentionable = role.role.mentionable
    currentRole.position = role.role.position

    if (worker.options.cacheControl.roles) {
      const newRole = {} as APIRole
      worker.options.cacheControl.roles.forEach(key => {
        newRole[key] = (currentRole as APIRole)[key] as never
      })
      newRole.id = currentRole.id
      currentRole = newRole
    }

    guildRoles.set(currentRole.id, currentRole)
  })

  events.add('GUILD_ROLE_DELETE', (role) => {
    const guildRoles = worker.guildRoles.get(role.guild_id)

    guildRoles?.delete(role.role_id)
  })

  events.add('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return

    worker.guildRoles.delete(guild.id)
  })
}