import { GatewayChannelCreateDispatchData, GatewayChannelDeleteDispatchData, GatewayChannelPinsUpdateDispatchData, GatewayChannelUpdateDispatchData, GatewayDispatchPayload, GatewayGuildBanAddDispatchData, GatewayGuildBanRemoveDispatchData, GatewayGuildCreateDispatchData, GatewayGuildDeleteDispatchData, GatewayGuildEmojisUpdateDispatchData, GatewayGuildIntegrationsUpdateDispatchData, GatewayGuildMemberAddDispatchData, GatewayGuildMemberRemoveDispatchData, GatewayGuildMembersChunkDispatchData, GatewayGuildMemberUpdateDispatchData, GatewayGuildRoleCreateDispatchData, GatewayGuildRoleDeleteDispatchData, GatewayGuildRoleUpdateDispatchData, GatewayGuildUpdateDispatchData, GatewayInteractionCreateDispatchData, GatewayInviteCreateDispatchData, GatewayInviteDeleteDispatchData, GatewayMessageCreateDispatchData, GatewayMessageDeleteBulkDispatchData, GatewayMessageDeleteDispatchData, GatewayMessageReactionAddDispatchData, GatewayMessageReactionRemoveAllDispatchData, GatewayMessageReactionRemoveDispatchData, GatewayMessageReactionRemoveEmojiDispatchData, GatewayMessageUpdateDispatchData, GatewayPresenceUpdateDispatchData, GatewayReadyDispatchData, GatewayResumeData, GatewayTypingStartDispatchData, GatewayUserUpdateDispatchData, GatewayVoiceServerUpdateDispatchData, GatewayVoiceState, GatewayWebhooksUpdateDispatchData } from 'discord-api-types'
import { Shard } from '../socket/Shard';

export type CachedGuild = Pick<DiscordEventMap['GUILD_CREATE'], Exclude<keyof DiscordEventMap['GUILD_CREATE'], 'channels' | 'roles' | 'members' | 'presences'>>

export interface DiscordDefaultEventMap {
  "CHANNEL_CREATE": GatewayChannelCreateDispatchData,
  "CHANNEL_DELETE": GatewayChannelDeleteDispatchData,
  "CHANNEL_PINS_UPDATE": GatewayChannelPinsUpdateDispatchData,
  "CHANNEL_UPDATE": GatewayChannelUpdateDispatchData,
  "GUILD_BAN_ADD": GatewayGuildBanAddDispatchData,
  "GUILD_BAN_REMOVE": GatewayGuildBanRemoveDispatchData,
  "GUILD_CREATE": GatewayGuildCreateDispatchData,
  "GUILD_DELETE": GatewayGuildDeleteDispatchData,
  "GUILD_EMOJIS_UPDATE": GatewayGuildEmojisUpdateDispatchData,
  "GUILD_INTEGRATIONS_UPDATE": GatewayGuildIntegrationsUpdateDispatchData,
  "GUILD_MEMBER_ADD": GatewayGuildMemberAddDispatchData,
  "GUILD_MEMBER_REMOVE": GatewayGuildMemberRemoveDispatchData,
  "GUILD_MEMBERS_CHUNK": GatewayGuildMembersChunkDispatchData,
  "GUILD_MEMBER_UPDATE": GatewayGuildMemberUpdateDispatchData,
  "GUILD_ROLE_CREATE": GatewayGuildRoleCreateDispatchData,
  "GUILD_ROLE_DELETE": GatewayGuildRoleDeleteDispatchData,
  "GUILD_ROLE_UPDATE": GatewayGuildRoleUpdateDispatchData,
  "GUILD_UPDATE": GatewayGuildUpdateDispatchData,
  "INTERACTION_CREATE": GatewayInteractionCreateDispatchData,
  "INVITE_CREATE": GatewayInviteCreateDispatchData,
  "INVITE_DELETE": GatewayInviteDeleteDispatchData,
  "MESSAGE_CREATE": GatewayMessageCreateDispatchData,
  "MESSAGE_DELETE": GatewayMessageDeleteDispatchData,
  "MESSAGE_DELETE_BULK": GatewayMessageDeleteBulkDispatchData,
  "MESSAGE_REACTION_ADD": GatewayMessageReactionAddDispatchData,
  "MESSAGE_REACTION_REMOVE": GatewayMessageReactionRemoveDispatchData,
  "MESSAGE_REACTION_REMOVE_ALL": GatewayMessageReactionRemoveAllDispatchData,
  "MESSAGE_REACTION_REMOVE_EMOJI": GatewayMessageReactionRemoveEmojiDispatchData,
  "MESSAGE_UPDATE": GatewayMessageUpdateDispatchData,
  "PRESENCE_UPDATE": GatewayPresenceUpdateDispatchData,
  "RESUMED": GatewayResumeData,
  "TYPING_START": GatewayTypingStartDispatchData,
  "USER_UPDATE": GatewayUserUpdateDispatchData,
  "VOICE_SERVER_UPDATE": GatewayVoiceServerUpdateDispatchData,
  "VOICE_STATE_UPDATE": GatewayVoiceState,
  "WEBHOOKS_UPDATE": GatewayWebhooksUpdateDispatchData,
  "READY": GatewayReadyDispatchData | null
}

export interface DiscordEventMap extends DiscordDefaultEventMap {
  "SHARD_READY": Shard
  "GUILD_UNAVAILABLE": CachedGuild
  "READY": null
  "*": GatewayDispatchPayload
}