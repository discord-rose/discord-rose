"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.self = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
function self(events, worker) {
    worker.selfMember = new collection_1.default();
    events.on('GUILD_MEMBER_ADD', (member) => {
        var _a;
        if (((_a = member.user) === null || _a === void 0 ? void 0 : _a.id) !== worker.user.id)
            return;
        worker.selfMember.set(member.guild_id, member);
    });
    events.on('GUILD_MEMBER_UPDATE', (member) => {
        var _a;
        if (((_a = member.user) === null || _a === void 0 ? void 0 : _a.id) !== worker.user.id)
            return;
        const currentMember = worker.selfMember.get(member.guild_id);
        if (!currentMember)
            return worker.selfMember.set(member.guild_id, member);
        Object.keys(member).forEach(key => {
            currentMember[key] = member[key];
        });
        worker.selfMember.set(member.guild_id, currentMember);
    });
    events.on('GUILD_DELETE', (guild) => {
        if (guild.unavailable)
            return;
        worker.selfMember.delete(guild.id);
    });
}
exports.self = self;
