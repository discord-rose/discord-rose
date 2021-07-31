import { APIEmbed } from 'discord-api-types'

export { ClusterStats, ShardStats, State, ThreadEvents } from './clustering/ThreadComms'

export { BaseBotOptions, BotOptions } from './typings/options'

export { Master } from './clustering/master/Master'
export * from './clustering/master/Cluster'
export * from './clustering/master/Sharder'

export * from './clustering/worker/Worker'
export * from './clustering/worker/Thread'

export * from './clustering/worker/single/SingleWorker'

export * from './rest/Manager'
export * from './rest/resources/Channels'
export * from './rest/resources/Emojis'
export * from './rest/resources/Guilds'
export * from './rest/resources/Interactions'
export * from './rest/resources/Members'
export * from './rest/resources/Messages'
export * from './rest/resources/Misc'
export * from './rest/resources/Users'
export * from './rest/resources/Webhooks'

export * from './socket/Shard'

export * from './structures/Embed'
export * from './structures/CommandHandler'
export * from './structures/CommandContext'
export * from './structures/SlashCommandContext'

export { PermissionsUtils } from './utils/Permissions'

export { CommandOptions, CommandType } from './typings/lib'
export { DiscordEventMap, CachedGuild, CachedVoiceState } from './typings/Discord'

export { Snowflake } from 'discord-api-types'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      ROSE_DEFAULT_EMBED: APIEmbed
    }
  }
}
