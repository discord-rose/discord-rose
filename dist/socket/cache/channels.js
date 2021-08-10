"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.channels = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
function channels(events, worker) {
    worker.channels = new collection_1.default();
    events.on('CHANNEL_CREATE', (c) => {
        if (worker.options.cache.channels !== true && !worker.options.cache.channels.includes(c.type))
            return;
        let channel = Object.assign({}, c);
        if (worker.options.cacheControl.channels) {
            const newChannel = {};
            worker.options.cacheControl.channels.forEach(key => {
                newChannel[key] = channel[key];
            });
            newChannel.guild_id = channel.guild_id;
            newChannel.id = channel.id;
            channel = newChannel;
        }
        worker.channels.set(channel.id, channel);
    });
    events.on('CHANNEL_UPDATE', (channel) => {
        if (worker.options.cache.channels !== true && !worker.options.cache.channels.includes(channel.type))
            return;
        const currentChannel = worker.channels.get(channel.id);
        if (!currentChannel)
            return;
        if (worker.options.cacheControl.channels) {
            worker.options.cacheControl.channels.forEach(key => {
                currentChannel[key] = channel[key];
            });
            currentChannel.guild_id = channel.guild_id;
            currentChannel.id = channel.id;
        }
        else {
            Object.keys(channel).forEach(key => {
                currentChannel[key] = channel[key];
            });
        }
        worker.channels.set(channel.id, currentChannel);
    });
    events.on('CHANNEL_DELETE', (channel) => {
        worker.channels.delete(channel.id);
    });
    events.on('GUILD_DELETE', (guild) => {
        if (guild.unavailable)
            return;
        worker.channels.filter(x => x.guild_id === guild.id)
            .forEach(x => worker.channels.delete(x.id));
    });
}
exports.channels = channels;
