import Collection from '@discordjs/collection';
import Worker from '../../clustering/worker/Worker';
import { InternalEvents } from './InternalEvents';

export function roles (events: InternalEvents, worker: Worker) {
  worker.guildRoles = new Collection()

  events.add('GUILD_ROLE_CREATE', (role) => {
    let guildRoles = worker.guildRoles.get(role.guild_id)
    if (!guildRoles) {
      guildRoles = new Collection()
      worker.guildRoles.set(role.guild_id, guildRoles)
    }

    guildRoles.set(role.guild_id, role.role)
  })

  events.add('GUILD_ROLE_UPDATE', (role) => {
    const guildRoles = worker.guildRoles.get(role.guild_id)
    const currentRole = guildRoles.get(role.role.id)
    
    currentRole.name = role.role.name
    currentRole.permissions = role.role.permissions
    currentRole.color = role.role.color
    currentRole.hoist = role.role.hoist
    currentRole.mentionable = role.role.mentionable
    currentRole.position = role.role.position

    guildRoles.set(currentRole.id, currentRole)
  })

  events.add('GUILD_ROLE_DELETE', (role) => {
    const guildRoles = worker.guildRoles.get(role.guild_id)

    guildRoles.delete(role.role_id)
  })
}