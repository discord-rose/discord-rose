export const bits = {
  createInvites: 0x00000001,
  kick: 0x00000002,
  ban: 0x00000004,
  administrator: 0x00000008,
  manageChannels: 0x00000010,
  manageGuild: 0x00000020,
  addReactions: 0x00000040,
  auditLog: 0x00000080,
  prioritySpeaker: 0x00000100,
  stream: 0x00000200,
  viewChannel: 0x00000400,
  sendMessages: 0x00000800,
  tts: 0x00001000,
  manageMessages: 0x00002000,
  embed: 0x00004000,
  files: 0x00008000,
  readHistory: 0x00010000,
  mentionEveryone: 0x00020000,
  externalEmojis: 0x00040000,
  viewInsights: 0x00080000,
  connect: 0x00100000,
  speak: 0x00200000,
  mute: 0x00400000,
  deafen: 0x00800000,
  move: 0x01000000,
  useVoiceActivity: 0x02000000,
  nickname: 0x04000000,
  manageNicknames: 0x08000000,
  roles: 0x10000000,
  webhooks: 0x20000000,
  emojis: 0x40000000
}

export class PermissionsUtils {
  static hasPerms (perms: number, bit: number): boolean {
    if ((perms & bits.administrator) !== 0) return true // administrator
    if ((perms & bit) !== 0) return true

    return false
  }

  static has (bit: number, perm: keyof typeof bits): boolean {
    return this.hasPerms(bit, bits[perm])
  }
}
