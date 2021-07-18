import { Worker } from '../../clustering/worker/Worker'
import { CacheManager } from '../CacheManager'

import Collection from '@discordjs/collection'
import { GatewayVoiceState, Snowflake } from 'discord-api-types'
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

    let voiceState = Object.assign({}, data)
    if (worker.options.cacheControl.voiceStates) {
      const newVoiceState = {} as GatewayVoiceState
      worker.options.cacheControl.voiceStates.forEach(key => {
        newVoiceState[key] = data[key] as never
      })
      newVoiceState.guild_id = voiceState.guild_id
      newVoiceState.channel_id = voiceState.channel_id
      newVoiceState.user_id = voiceState.user_id
      newVoiceState.session_id = voiceState.session_id
      voiceState = newVoiceState
    }
    if (!voiceState.guild_id) return

    if (!currentSession && voiceState.channel_id) {
      const channel = getVoiceState(voiceState.channel_id, voiceState.guild_id)

      channel.users.set(voiceState.user_id, voiceState)
    } else if (currentSession && !voiceState.channel_id) {
      currentSession.users.delete(voiceState.user_id)

      if (currentSession.users.size < 1) worker.voiceStates.delete(currentSession.channel_id)
    } else if (currentSession && voiceState.channel_id && currentSession.channel_id !== voiceState.channel_id) {
      currentSession?.users.delete(voiceState.user_id)

      if (currentSession.users.size < 1) worker.voiceStates.delete(currentSession.channel_id)

      const channel = getVoiceState(voiceState.channel_id, voiceState.guild_id)

      channel.users.set(voiceState.user_id, voiceState)
    } else {
      currentSession?.users.set(voiceState.user_id, voiceState)
    }
  })
}
