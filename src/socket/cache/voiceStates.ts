import { Worker } from '../../clustering/worker/Worker'
import { CacheManager } from '../CacheManager'

import Collection from '@discordjs/collection'
import { Snowflake } from 'discord-api-types'
import { CachedVoiceState } from '../../typings/Discord'

export function voiceStates (events: CacheManager, worker: Worker): void {
  worker.voiceStates = new Collection()

  function getVoiceState (channelId: Snowflake, guildId: Snowflake): CachedVoiceState {
    const inCache = worker.voiceStates.get(channelId)

    if (inCache) return inCache

    const newState: CachedVoiceState = {
      channel_id: channelId,
      guild_id: guildId,
      users: new Collection()
    }

    worker.voiceStates.set(channelId, newState)

    return newState
  }

  events.on('GUILD_CREATE', (guild) => {
    guild.voice_states?.forEach(state => {
      // @ts-expect-error
      state.guild_id = guild.id
      events.emit('VOICE_STATE_UPDATE', state)
    })
  })

  events.on('GUILD_DELETE', (guild) => {
    if (guild.unavailable) return

    worker.voiceStates.filter(x => x.guild_id === guild.id).forEach(state => {
      worker.voiceStates.delete(state.channel_id)
    })
  })

  events.on('VOICE_STATE_UPDATE', (data) => {
    const currentSession = worker.voiceStates.find(x => x.users.some(x => x.session_id === data.session_id))
    if (!data.guild_id) return

    if (!currentSession && data.channel_id) {
      const channel = getVoiceState(data.channel_id, data.guild_id)

      channel.users.set(data.user_id, data)
    } else if (currentSession && !data.channel_id) {
      currentSession.users.delete(data.user_id)

      if (currentSession.users.size < 1) worker.voiceStates.delete(currentSession.channel_id)
    } else if (currentSession && data.channel_id && currentSession.channel_id !== data.channel_id) {
      currentSession?.users.delete(data.user_id)

      if (currentSession.users.size < 1) worker.voiceStates.delete(currentSession.channel_id)

      const channel = getVoiceState(data.channel_id, data.guild_id)

      channel.users.set(data.user_id, data)
    } else {
      currentSession?.users.set(data.user_id, data)
    }
  })
}
