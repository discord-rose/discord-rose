"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceStates = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
function voiceStates(events, worker) {
    worker.voiceStates = new collection_1.default();
    function getVoiceState(channelId, guildId) {
        const inCache = worker.voiceStates.get(channelId);
        if (inCache)
            return inCache;
        const newState = {
            channel_id: channelId,
            guild_id: guildId,
            users: new collection_1.default()
        };
        worker.voiceStates.set(channelId, newState);
        return newState;
    }
    events.on('GUILD_CREATE', (guild) => {
        var _a;
        (_a = guild.voice_states) === null || _a === void 0 ? void 0 : _a.forEach(state => {
            // @ts-expect-error
            state.guild_id = guild.id;
            events.emit('VOICE_STATE_UPDATE', state);
        });
    });
    events.on('GUILD_DELETE', (guild) => {
        if (guild.unavailable)
            return;
        worker.voiceStates.filter(x => x.guild_id === guild.id).forEach(state => {
            worker.voiceStates.delete(state.channel_id);
        });
    });
    events.on('VOICE_STATE_UPDATE', (data) => {
        const currentSession = worker.voiceStates.find(x => x.users.some(x => x.session_id === data.session_id));
        if (!data.guild_id)
            return;
        if (!currentSession && data.channel_id) {
            const channel = getVoiceState(data.channel_id, data.guild_id);
            channel.users.set(data.user_id, data);
        }
        else if (currentSession && !data.channel_id) {
            currentSession.users.delete(data.user_id);
            if (currentSession.users.size < 1)
                worker.voiceStates.delete(currentSession.channel_id);
        }
        else if (currentSession && data.channel_id && currentSession.channel_id !== data.channel_id) {
            currentSession === null || currentSession === void 0 ? void 0 : currentSession.users.delete(data.user_id);
            if (currentSession.users.size < 1)
                worker.voiceStates.delete(currentSession.channel_id);
            const channel = getVoiceState(data.channel_id, data.guild_id);
            channel.users.set(data.user_id, data);
        }
        else {
            currentSession === null || currentSession === void 0 ? void 0 : currentSession.users.set(data.user_id, data);
        }
    });
}
exports.voiceStates = voiceStates;
