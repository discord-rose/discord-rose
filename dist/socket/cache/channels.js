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
    events.on('CHANNEL_UPDATE', (c) => {
        if (worker.options.cache.channels !== true && !worker.options.cache.channels.includes(c.type))
            return;
        const channel = Object.assign({}, c);
        let currentChannel = worker.channels.get(channel.id);
        if (!currentChannel)
            return;
        currentChannel.name = channel.name;
        currentChannel.type = channel.type;
        currentChannel.position = channel.position;
        currentChannel.topic = channel.topic;
        currentChannel.nsfw = channel.nsfw;
        currentChannel.rate_limit_per_user = channel.rate_limit_per_user;
        currentChannel.bitrate = channel.bitrate;
        currentChannel.user_limit = channel.user_limit;
        currentChannel.permission_overwrites = channel.permission_overwrites;
        currentChannel.parent_id = channel.parent_id;
        if (worker.options.cacheControl.channels) {
            const newChannel = {};
            worker.options.cacheControl.channels.forEach(key => {
                newChannel[key] = channel[key];
            });
            newChannel.guild_id = channel.guild_id;
            newChannel.id = channel.id;
            currentChannel = newChannel;
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
