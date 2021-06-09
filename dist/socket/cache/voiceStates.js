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
        let voiceState = Object.assign({}, data);
        if (worker.options.cacheControl.voiceStates) {
            const newVoiceState = {};
            worker.options.cacheControl.voiceStates.forEach(key => {
                newVoiceState[key] = data[key];
            });
            newVoiceState.guild_id = voiceState.guild_id;
            newVoiceState.channel_id = voiceState.channel_id;
            newVoiceState.user_id = voiceState.user_id;
            voiceState = newVoiceState;
        }
        if (!voiceState.guild_id)
            return;
        if (!currentSession && voiceState.channel_id) {
            const channel = getVoiceState(voiceState.channel_id, voiceState.guild_id);
            channel.users.set(voiceState.user_id, voiceState);
        }
        else if (currentSession && !voiceState.channel_id) {
            currentSession.users.delete(voiceState.user_id);
            if (currentSession.users.size < 1)
                worker.voiceStates.delete(currentSession.channel_id);
        }
        else if (currentSession && voiceState.channel_id && currentSession.channel_id !== voiceState.channel_id) {
            currentSession === null || currentSession === void 0 ? void 0 : currentSession.users.delete(voiceState.user_id);
            if (currentSession.users.size < 1)
                worker.voiceStates.delete(currentSession.channel_id);
            const channel = getVoiceState(voiceState.channel_id, voiceState.guild_id);
            channel.users.set(voiceState.user_id, voiceState);
        }
        else {
            currentSession === null || currentSession === void 0 ? void 0 : currentSession.users.set(voiceState.user_id, voiceState);
        }
    });
}
exports.voiceStates = voiceStates;
