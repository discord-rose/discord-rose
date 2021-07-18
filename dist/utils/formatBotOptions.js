"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBotOptions = void 0;
const Master_1 = require("../clustering/master/Master");
const CachedChannelTypes = ['text', 'voice', 'category'];
function formatBotOptions(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const opts = {
        token: options.token,
        shards: (_a = options.shards) !== null && _a !== void 0 ? _a : 'auto',
        shardsPerCluster: (_b = options.shardsPerCluster) !== null && _b !== void 0 ? _b : 5,
        shardOffset: (_c = options.shardOffset) !== null && _c !== void 0 ? _c : 0,
        cache: options.cache === false
            ? {
                guilds: false,
                roles: false,
                channels: false,
                self: false,
                members: false,
                messages: false,
                users: false,
                voiceStates: false
            }
            : {
                guilds: (_e = (_d = options.cache) === null || _d === void 0 ? void 0 : _d.guilds) !== null && _e !== void 0 ? _e : true,
                roles: (_g = (_f = options.cache) === null || _f === void 0 ? void 0 : _f.roles) !== null && _g !== void 0 ? _g : true,
                channels: (_j = (_h = options.cache) === null || _h === void 0 ? void 0 : _h.channels) !== null && _j !== void 0 ? _j : true,
                self: (_l = (_k = options.cache) === null || _k === void 0 ? void 0 : _k.self) !== null && _l !== void 0 ? _l : true,
                members: (_o = (_m = options.cache) === null || _m === void 0 ? void 0 : _m.members) !== null && _o !== void 0 ? _o : false,
                messages: (_q = (_p = options.cache) === null || _p === void 0 ? void 0 : _p.messages) !== null && _q !== void 0 ? _q : false,
                users: (_s = (_r = options.cache) === null || _r === void 0 ? void 0 : _r.users) !== null && _s !== void 0 ? _s : false,
                voiceStates: (_u = (_t = options.cache) === null || _t === void 0 ? void 0 : _t.voiceStates) !== null && _u !== void 0 ? _u : false
            },
        cacheControl: (_v = options.cacheControl) !== null && _v !== void 0 ? _v : {
            channels: false,
            guilds: false,
            members: false,
            roles: false
        },
        ws: (_w = options.ws) !== null && _w !== void 0 ? _w : '',
        intents: Array.isArray(options.intents)
            ? options.intents.reduce((a, b) => a | Master_1.Intents[b], 0)
            : options.intents === true
                ? Object.values(Master_1.Intents).reduce((a, b) => a | b, 0)
                : options.intents
                    ? options.intents
                    : Object.values(Master_1.Intents).reduce((a, b) => a | b) & ~Master_1.Intents.GUILD_MEMBERS & ~Master_1.Intents.GUILD_PRESENCES,
        warnings: {
            cachedIntents: (_y = (_x = options.warnings) === null || _x === void 0 ? void 0 : _x.cachedIntents) !== null && _y !== void 0 ? _y : true
        },
        log: options.log,
        rest: options.rest,
        spawnTimeout: (_z = options.spawnTimeout) !== null && _z !== void 0 ? _z : 5100,
        clusterStartRetention: (_0 = options.clusterStartRetention) !== null && _0 !== void 0 ? _0 : 3
    };
    if (((_1 = opts.cache) === null || _1 === void 0 ? void 0 : _1.channels) === true) {
        opts.cache.channels = true;
    }
    else if (opts.cache.channels) {
        const channelCaches = ((_2 = opts.cache) === null || _2 === void 0 ? void 0 : _2.channels) === true ? CachedChannelTypes : (_3 = opts.cache.channels) !== null && _3 !== void 0 ? _3 : [];
        opts.cache.channels = [];
        if (channelCaches.includes('text'))
            (_5 = (_4 = opts.cache) === null || _4 === void 0 ? void 0 : _4.channels) === null || _5 === void 0 ? void 0 : _5.push(5 /* GuildNews */, 0 /* GuildText */);
        if (channelCaches.includes('voice'))
            (_7 = (_6 = opts.cache) === null || _6 === void 0 ? void 0 : _6.channels) === null || _7 === void 0 ? void 0 : _7.push(2 /* GuildVoice */);
        if (channelCaches.includes('category'))
            (_9 = (_8 = opts.cache) === null || _8 === void 0 ? void 0 : _8.channels) === null || _9 === void 0 ? void 0 : _9.push(4 /* GuildCategory */);
    }
    if ((_10 = opts.warnings) === null || _10 === void 0 ? void 0 : _10.cachedIntents) {
        const warn = (key, intent) => console.warn(`WARNING: CacheOptions.${key} was turned on, but is missing the ${intent} intent. Meaning your cache with be empty. Either turn this on, or if it's intentional set Options.warnings.cachedIntents to false.`);
        if (((_11 = opts.cache) === null || _11 === void 0 ? void 0 : _11.guilds) && ((opts.intents & Master_1.Intents.GUILDS) === 0))
            warn('guilds', 'GUILDS');
        if (((_12 = opts.cache) === null || _12 === void 0 ? void 0 : _12.roles) && ((opts.intents & Master_1.Intents.GUILDS) === 0))
            warn('roles', 'GUILDS');
        if (((_13 = opts.cache) === null || _13 === void 0 ? void 0 : _13.channels) && ((opts.intents & Master_1.Intents.GUILDS) === 0))
            warn('channels', 'GUILDS');
        if (((_14 = opts.cache) === null || _14 === void 0 ? void 0 : _14.members) && ((opts.intents & Master_1.Intents.GUILD_MEMBERS) === 0))
            warn('members', 'GUILD_MEMBERS');
        if (((_15 = opts.cache) === null || _15 === void 0 ? void 0 : _15.messages) && ((opts.intents & Master_1.Intents.GUILD_MESSAGES) === 0))
            warn('messages', 'GUILD_MESSAGES');
    }
    return opts;
}
exports.formatBotOptions = formatBotOptions;
