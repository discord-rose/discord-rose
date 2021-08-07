import Collection from '@discordjs/collection';
import types, { Snowflake } from 'discord-api-types';
import { Shard } from '../socket/Shard';
/**
 * Represents a guild cached in Worker#guilds. Does not contain `channels`, `roles`, `members`, or `presences`.
 */
export declare type CachedGuild = Pick<DiscordEventMap['GUILD_CREATE'], Exclude<keyof DiscordEventMap['GUILD_CREATE'], 'channels' | 'roles' | 'members' | 'presences'>>;
export interface CachedVoiceState {
    channel_id: Snowflake;
    guild_id: Snowflake;
    users: Collection<Snowflake, DiscordEventMap['VOICE_STATE_UPDATE']>;
}
export interface DiscordDefaultEventMap {
    'APPLICATION_COMMAND_CREATE': types.GatewayApplicationCommandCreateDispatchData;
    'APPLICATION_COMMAND_UPDATE': types.GatewayApplicationCommandUpdateDispatchData;
    'APPLICATION_COMMAND_DELETE': types.GatewayApplicationCommandDeleteDispatchData;
    'CHANNEL_CREATE': types.GatewayChannelCreateDispatchData;
    'CHANNEL_UPDATE': types.GatewayChannelUpdateDispatchData;
    'CHANNEL_DELETE': types.GatewayChannelDeleteDispatchData;
    'CHANNEL_PINS_UPDATE': types.GatewayChannelPinsUpdateDispatchData;
    'THREAD_CREATE': types.GatewayThreadCreateDispatchData;
    'THREAD_UPDATE': types.GatewayThreadUpdateDispatchData;
    'THREAD_DELETE': types.GatewayThreadDeleteDispatchData;
    'THREAD_LIST_SYNC': types.GatewayThreadListSyncDispatchData;
    'THREAD_MEMBER_UPDATE': types.GatewayThreadMemberUpdateDispatchData;
    'THREAD_MEMBERS_UPDATE': types.GatewayThreadMembersUpdateDispatchData;
    'GUILD_CREATE': types.GatewayGuildCreateDispatchData;
    'GUILD_UPDATE': types.GatewayGuildUpdateDispatchData;
    'GUILD_DELETE': types.GatewayGuildDeleteDispatchData;
    'GUILD_BAN_ADD': types.GatewayGuildBanAddDispatchData;
    'GUILD_BAN_REMOVE': types.GatewayGuildBanRemoveDispatchData;
    'GUILD_EMOJIS_UPDATE': types.GatewayGuildEmojisUpdateDispatchData;
    'GUILD_STICKERS_UPDATE': types.GatewayGuildStickersUpdateDispatchData;
    'GUILD_INTEGRATIONS_UPDATE': types.GatewayGuildIntegrationsUpdateDispatchData;
    'GUILD_MEMBER_ADD': types.GatewayGuildMemberAddDispatchData;
    'GUILD_MEMBER_REMOVE': types.GatewayGuildMemberRemoveDispatchData;
    'GUILD_MEMBER_UPDATE': types.GatewayGuildMemberUpdateDispatchData;
    'GUILD_MEMBERS_CHUNK': types.GatewayGuildMembersChunkDispatchData;
    'GUILD_ROLE_CREATE': types.GatewayGuildRoleCreateDispatchData;
    'GUILD_ROLE_UPDATE': types.GatewayGuildRoleUpdateDispatchData;
    'GUILD_ROLE_DELETE': types.GatewayGuildRoleDeleteDispatchData;
    'INTEGRATION_CREATE': types.GatewayIntegrationCreateDispatchData;
    'INTEGRATION_UPDATE': types.GatewayIntegrationUpdateDispatchData;
    'INTEGRATION_DELETE': types.GatewayIntegrationDeleteDispatchData;
    'INTERACTION_CREATE': types.GatewayInteractionCreateDispatchData;
    'INVITE_CREATE': types.GatewayInviteCreateDispatchData;
    'INVITE_DELETE': types.GatewayInviteDeleteDispatchData;
    'MESSAGE_CREATE': types.GatewayMessageCreateDispatchData;
    'MESSAGE_UPDATE': types.GatewayMessageUpdateDispatchData;
    'MESSAGE_DELETE': types.GatewayMessageDeleteDispatchData;
    'MESSAGE_DELETE_BULK': types.GatewayMessageDeleteBulkDispatchData;
    'MESSAGE_REACTION_ADD': types.GatewayMessageReactionAddDispatchData;
    'MESSAGE_REACTION_REMOVE': types.GatewayMessageReactionRemoveDispatchData;
    'MESSAGE_REACTION_REMOVE_ALL': types.GatewayMessageReactionRemoveAllDispatchData;
    'MESSAGE_REACTION_REMOVE_EMOJI': types.GatewayMessageReactionRemoveEmojiDispatchData;
    'PRESENCE_UPDATE': types.GatewayPresenceUpdateDispatchData;
    'STAGE_INSTANCE_CREATE': types.GatewayStageInstanceCreateDispatchData;
    'STAGE_INSTANCE_DELETE': types.GatewayStageInstanceDeleteDispatchData;
    'STAGE_INSTANCE_UPDATE': types.GatewayStageInstanceUpdateDispatchData;
    'TYPING_START': types.GatewayTypingStartDispatchData;
    'USER_UPDATE': types.GatewayUserUpdateDispatchData;
    'VOICE_STATE_UPDATE': types.GatewayVoiceState;
    'VOICE_SERVER_UPDATE': types.GatewayVoiceServerUpdateDispatchData;
    'WEBHOOKS_UPDATE': types.GatewayWebhooksUpdateDispatchData;
    'RESUMED': types.GatewayResumeData;
    'READY': types.GatewayReadyDispatchData | null;
}
export interface DiscordEventMap extends DiscordDefaultEventMap {
    'SHARD_READY': Shard;
    'GUILD_UNAVAILABLE': [CachedGuild | types.APIUnavailableGuild];
    'READY': null;
    '*': types.GatewayDispatchPayload;
}
