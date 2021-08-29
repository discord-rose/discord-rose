import Collection from '@discordjs/collection'
import { APIGuildMember, APIOverwrite, OverwriteType, Snowflake } from 'discord-api-types'
import { CachedGuild, DiscordEventMap } from '../typings/Discord'

export const bits = {
  createInvites: 0x0000000001,
  kick: 0x0000000002,
  ban: 0x0000000004,
  administrator: 0x0000000008,
  manageChannels: 0x0000000010,
  manageGuild: 0x0000000020,
  addReactions: 0x0000000040,
  auditLog: 0x0000000080,
  prioritySpeaker: 0x0000000100,
  stream: 0x0000000200,
  viewChannel: 0x0000000400,
  sendMessages: 0x0000000800,
  tts: 0x0000001000,
  manageMessages: 0x0000002000,
  embed: 0x0000004000,
  files: 0x0000008000,
  readHistory: 0x0000010000,
  mentionEveryone: 0x0000020000,
  externalEmojis: 0x0000040000,
  viewInsights: 0x0000080000,
  connect: 0x0000100000,
  speak: 0x0000200000,
  mute: 0x0000400000,
  deafen: 0x0000800000,
  move: 0x0001000000,
  useVoiceActivity: 0x0002000000,
  nickname: 0x0004000000,
  manageNicknames: 0x0008000000,
  manageRoles: 0x0010000000,
  webhooks: 0x0020000000,
  emojis: 0x0040000000,
  useApplicationCommands: 0x0080000000,
  requestToSpeak: 0x0100000000,
  manageThreads: 0x0400000000,
  createPublicThreads: 0x0800000000,
  createPrivateThreads: 0x1000000000,
  useExternalStickers: 0x2000000000,
  sendMessagesInThreads: 0x4000000000
}

export const PermissionsUtils = {
  bits: bits,

  /**
   * Test a permission on a user
   * @param bit Combined permission
   * @param perm Permission name to test
   * @returns Whether or not the user has permissions
   */
  has (bit: number | bigint, perm: keyof typeof bits): boolean {
    return this.hasPerms(bit, BigInt(bits[perm]))
  },

  /**
   * @deprecated
   */
  calculate (member: APIGuildMember, guild: CachedGuild, roleList: Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>, required: keyof typeof bits): boolean {
    if (guild.owner_id === member.user?.id) return true
    return this.has(
      member.roles.reduce(
        (a, b) => a | Number(roleList.get(b)?.permissions),
        Number(roleList.get(guild.id)?.permissions)
      ),
      required
    )
  },

  /**
   * Adds multiple permission sources together
   * @param data Data filled with possible permission data
   * @returns Full permission bit
   */
  combine (data: { member: APIGuildMember, guild: CachedGuild, roleList?: Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>, overwrites?: APIOverwrite[] }): number {
    if (data.member.user?.id === data.guild.owner_id) return PermissionsUtils.bits.administrator
    let result = data.roleList ? BigInt(data.roleList.get(data.guild.id)?.permissions ?? 0) : BigInt(0)

    if (data.roleList) {
      data.member.roles.forEach(role => {
        const r = data.roleList?.get(role)
        if (!r) return
        result |= BigInt(r.permissions)
      })
    }

    if (data.overwrites) {
      let allow = BigInt(0)
      let deny = BigInt(0)

      data.overwrites.filter(x => x.type === OverwriteType.Role).forEach(overwrite => {
        if (overwrite.id === data.guild.id) {
          result |= BigInt(overwrite.allow)
          result &= ~BigInt(overwrite.deny)
          return
        }

        if (!data.member.roles.includes(overwrite.id)) return

        allow |= BigInt(overwrite.allow)
        deny |= BigInt(overwrite.deny)
      })

      result &= ~deny
      result |= allow

      data.overwrites.filter(x => x.type === OverwriteType.Member && data.member.user?.id === x.id).forEach(overwrite => {
        result &= ~BigInt(overwrite.deny)
        result |= BigInt(overwrite.allow)
      })
    }

    return Number(result)
  },

  /**
   * Test two bits together
   * @param perms Combined permissions
   * @param bit Number bit ermission to test
   * @returns Whether or not the user has permissions
   */
  hasPerms (perms: number | bigint, bit: number | bigint): boolean {
    if (Number(BigInt(perms) & BigInt(bits.administrator)) !== 0) return true // administrator
    if (Number(BigInt(perms) & BigInt(bit)) !== 0) return true

    return false
  }
}
