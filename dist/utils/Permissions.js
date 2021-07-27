"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsUtils = exports.bits = void 0;
exports.bits = {
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
    useSlashCommands: 0x0080000000,
    requestToSpeak: 0x0100000000,
    manageThreads: 0x0400000000,
    usePublicThreads: 0x0800000000,
    usePrivateThreads: 0x1000000000
};
exports.PermissionsUtils = {
    bits: exports.bits,
    /**
     * Test a permission on a user
     * @param bit Combined permission
     * @param perm Permission name to test
     * @returns Whether or not the user has permissions
     */
    has(bit, perm) {
        return this.hasPerms(bit, BigInt(exports.bits[perm]));
    },
    /**
     * @deprecated
     */
    calculate(member, guild, roleList, required) {
        var _a, _b;
        if (guild.owner_id === ((_a = member.user) === null || _a === void 0 ? void 0 : _a.id))
            return true;
        return this.has(member.roles.reduce((a, b) => { var _a; return a | Number((_a = roleList.get(b)) === null || _a === void 0 ? void 0 : _a.permissions); }, Number((_b = roleList.get(guild.id)) === null || _b === void 0 ? void 0 : _b.permissions)), required);
    },
    /**
     * Adds multiple permission sources together
     * @param data Data filled with possible permission data
     * @returns Full permission bit
     */
    combine(data) {
        var _a, _b, _c;
        if (((_a = data.member.user) === null || _a === void 0 ? void 0 : _a.id) === data.guild.owner_id)
            return exports.PermissionsUtils.bits.administrator;
        let result = data.roleList ? BigInt((_c = (_b = data.roleList.get(data.guild.id)) === null || _b === void 0 ? void 0 : _b.permissions) !== null && _c !== void 0 ? _c : 0) : BigInt(0);
        if (data.roleList) {
            data.member.roles.forEach(role => {
                var _a;
                const r = (_a = data.roleList) === null || _a === void 0 ? void 0 : _a.get(role);
                if (!r)
                    return;
                result |= BigInt(r.permissions);
            });
        }
        if (data.overwrites) {
            let allow = BigInt(0);
            let deny = BigInt(0);
            data.overwrites.filter(x => x.type === 0 /* Role */).forEach(overwrite => {
                if (overwrite.id === data.guild.id) {
                    result |= BigInt(overwrite.allow);
                    result &= ~BigInt(overwrite.deny);
                    return;
                }
                if (!data.member.roles.includes(overwrite.id))
                    return;
                allow |= BigInt(overwrite.allow);
                deny |= BigInt(overwrite.deny);
            });
            result &= ~deny;
            result |= allow;
            data.overwrites.filter(x => { var _a; return x.type === 1 /* Member */ && ((_a = data.member.user) === null || _a === void 0 ? void 0 : _a.id) === x.id; }).forEach(overwrite => {
                result &= ~BigInt(overwrite.deny);
                result |= BigInt(overwrite.allow);
            });
        }
        return Number(result);
    },
    /**
     * Test two bits together
     * @param perms Combined permissions
     * @param bit Number bit ermission to test
     * @returns Whether or not the user has permissions
     */
    hasPerms(perms, bit) {
        if (Number(BigInt(perms) & BigInt(exports.bits.administrator)) !== 0)
            return true; // administrator
        if (Number(BigInt(perms) & BigInt(bit)) !== 0)
            return true;
        return false;
    }
};
