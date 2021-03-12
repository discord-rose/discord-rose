import Collection from '@discordjs/collection';
import { APIUser } from 'discord-api-types';
import { Worker } from '../../clustering/worker/Worker';
import { CacheManager } from '../CacheManager';

export function users (events: CacheManager, worker: Worker) {
  worker.users = new Collection()

  events.add('GUILD_MEMBER_ADD', (member) => {
    if (!member.user) return
    worker.users.set(member.user.id, member.user)
  })

  events.add('MESSAGE_CREATE', (message) => {
    worker.users.set(message.author.id, message.author)
  })

  events.add('GUILD_MEMBER_UPDATE', (member) => {
    if (!member.user) return
    worker.users.set(member.user.id, member.user)
  })

  events.add('PRESENCE_UPDATE', (presence) => {
    if (!presence.user.username) return
    worker.users.set(presence.user.id, presence.user as APIUser)
  })

  events.add('VOICE_STATE_UPDATE', (voice) => {
    if (!voice.member?.user) return
    worker.users.set(voice.member.user.id, voice.member.user)
  })
  
  events.add('USER_UPDATE', (user) => {
    worker.users.set(user.id, user)
  })
}
