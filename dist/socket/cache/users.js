"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
function users(events, worker) {
    worker.users = new collection_1.default();
    events.on('GUILD_MEMBER_ADD', (member) => {
        if (!member.user)
            return;
        worker.users.set(member.user.id, member.user);
    });
    events.on('MESSAGE_CREATE', (message) => {
        worker.users.set(message.author.id, message.author);
    });
    events.on('GUILD_MEMBER_UPDATE', (member) => {
        if (!member.user)
            return;
        worker.users.set(member.user.id, member.user);
    });
    events.on('PRESENCE_UPDATE', (presence) => {
        if (!presence.user.username)
            return;
        worker.users.set(presence.user.id, presence.user);
    });
    events.on('VOICE_STATE_UPDATE', (voice) => {
        var _a;
        if (!((_a = voice.member) === null || _a === void 0 ? void 0 : _a.user))
            return;
        worker.users.set(voice.member.user.id, voice.member.user);
    });
    events.on('USER_UPDATE', (user) => {
        worker.users.set(user.id, user);
    });
}
exports.users = users;
