"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsUtils = exports.bits = void 0;
exports.bits = {
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
    manageRoles: 0x10000000,
    webhooks: 0x20000000,
    emojis: 0x40000000
};
exports.PermissionsUtils = {
    bits: exports.bits,
    hasPerms(perms, bit) {
        if ((perms & exports.bits.administrator) !== 0)
            return true; // administrator
        if ((perms & bit) !== 0)
            return true;
        return false;
    },
    has(bit, perm) {
        return this.hasPerms(bit, exports.bits[perm]);
    },
    calculate(member, guild, roleList, required) {
        var _a, _b;
        if (guild.owner_id === ((_a = member.user) === null || _a === void 0 ? void 0 : _a.id))
            return true;
        return this.has(member.roles.reduce((a, b) => { var _a; return a | Number((_a = roleList.get(b)) === null || _a === void 0 ? void 0 : _a.permissions); }, Number((_b = roleList.get(guild.id)) === null || _b === void 0 ? void 0 : _b.permissions)), required);
    }
};
