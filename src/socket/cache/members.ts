import Collection from '@discordjs/collection';
import Worker from '../../clustering/worker/Worker';
import { InternalEvents } from './InternalEvents';

export function members (events: InternalEvents, worker: Worker) {
  worker.members = new Collection()

  events.add('GUILD_MEMBER_ADD', (member) => {
    let guildMembers = worker.members.get(member.guild_id)
    if (!guildMembers) {
      guildMembers = new Collection()
      worker.members.set(member.guild_id, guildMembers)
    }

    guildMembers.set(member.user.id, member)
  })

  events.add('GUILD_MEMBER_UPDATE', (member) => {
    let guildMembers = worker.members.get(member.guild_id)
    if (!guildMembers) return
    const currentMember = guildMembers.get(member.user.id)
    if (!currentMember) return

    currentMember.nick = member.nick
    currentMember.roles = member.roles

    guildMembers.set(member.user.id, currentMember)
  })

  events.add('GUILD_MEMBER_REMOVE', (member) => {
    let guildMembers = worker.members.get(member.guild_id)
    if (!guildMembers) return

    guildMembers.delete(member.user.id)
  })

  events.add('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return

    worker.members.delete(guild.id)
  })
}