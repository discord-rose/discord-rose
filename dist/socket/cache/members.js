"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.members = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
function members(events, worker) {
    worker.members = new collection_1.default();
    events.on('GUILD_MEMBER_ADD', (m) => {
        var _a;
        let member = Object.assign({}, m);
        let guildMembers = worker.members.get(member.guild_id);
        if (!guildMembers) {
            guildMembers = new collection_1.default();
            worker.members.set(member.guild_id, guildMembers);
        }
        if (worker.options.cacheControl.members) {
            const newMember = {};
            worker.options.cacheControl.members.forEach(key => {
                newMember[key] = member[key];
            });
            newMember.guild_id = member.guild_id;
            newMember.user = member.user;
            member = newMember;
        }
        guildMembers.set((_a = member.user) === null || _a === void 0 ? void 0 : _a.id, member);
    });
    events.on('GUILD_MEMBER_UPDATE', (m) => {
        var _a, _b;
        const member = Object.assign({}, m);
        const guildMembers = worker.members.get(member.guild_id);
        if (!guildMembers)
            return;
        let currentMember = guildMembers.get((_a = member.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!currentMember)
            return;
        currentMember.nick = member.nick;
        currentMember.roles = member.roles;
        if (worker.options.cacheControl.members) {
            const newMember = {};
            worker.options.cacheControl.members.forEach(key => {
                newMember[key] = currentMember[key];
            });
            newMember.guild_id = member.guild_id;
            newMember.user = member.user;
            currentMember = newMember;
        }
        guildMembers.set((_b = member.user) === null || _b === void 0 ? void 0 : _b.id, currentMember);
    });
    events.on('GUILD_MEMBER_REMOVE', (member) => {
        const guildMembers = worker.members.get(member.guild_id);
        if (!guildMembers)
            return;
        guildMembers.delete(member.user.id);
    });
    events.on('GUILD_DELETE', (guild) => {
        if (guild.unavailable)
            return;
        worker.members.delete(guild.id);
    });
}
exports.members = members;
