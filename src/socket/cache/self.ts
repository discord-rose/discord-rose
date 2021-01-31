import Collection from '@discordjs/collection';
import Worker from '../../clustering/worker/Worker';
import { InternalEvents } from './InternalEvents';

export function self (events: InternalEvents, worker: Worker) {
  worker.selfMember = new Collection()

  events.add('GUILD_MEMBER_ADD', (member) => {
    if (member.user.id !== worker.user.id) return

    worker.selfMember.set(member.guild_id, member)
  })

  events.add('GUILD_MEMBER_UPDATE', (member) => {
    if (member.user.id !== worker.user.id) return

    const currentMember = worker.selfMember.get(member.guild_id)
    
    currentMember.nick = member.nick
    currentMember.roles = member.roles

    worker.selfMember.set(member.guild_id, currentMember)
  })

  events.add('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return
    
    worker.selfMember.delete(guild.id)
  })
}