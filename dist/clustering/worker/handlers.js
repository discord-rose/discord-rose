"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
exports.handlers = {
    START: async function (data, respond) {
        this.worker.options = data.options;
        await this.worker.start(data.shards);
        respond({});
    },
    START_SHARD: function (data) {
        const shard = this.worker.shards.get(data.id);
        shard === null || shard === void 0 ? void 0 : shard.start();
    },
    RESTART_SHARD: function ({ id }) {
        var _a;
        (_a = this.worker.shards.get(id)) === null || _a === void 0 ? void 0 : _a.restart(true, 1002, 'Internally restarted');
    },
    GET_GUILD: function ({ id }, respond) {
        var _a, _b;
        const guild = this.worker.guilds.get(id);
        if (!guild)
            respond({ error: 'Not in guild' });
        if (this.worker.guildRoles) {
            guild.roles = (_b = (_a = this.worker.guildRoles.get(guild.id)) === null || _a === void 0 ? void 0 : _a.array()) !== null && _b !== void 0 ? _b : [];
        }
        if (this.worker.channels) {
            guild.channels = this.worker.channels.filter(x => x.guild_id === guild.id).array();
        }
        respond(guild);
    },
    EVAL: async function (code, respond) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const worker = this.worker;
        try {
            // eslint-disable-next-line no-eval
            let ev = eval(code);
            if (ev.then)
                ev = await ev.catch((err) => ({ error: err.message }));
            // @ts-expect-error eval can be any
            respond(ev);
        }
        catch (err) {
            // @ts-expect-error eval can be any
            respond({ error: err.message });
        }
    },
    GET_STATS: function (_, respond) {
        respond({
            cluster: {
                id: this.id,
                memory: process.memoryUsage().heapTotal,
                uptime: process.uptime()
            },
            shards: this.worker.shards.map(x => {
                var _a, _b;
                return ({
                    id: x.id,
                    ping: x.ping,
                    guilds: (_b = (_a = this.worker.guilds).filter) === null || _b === void 0 ? void 0 : _b.call(_a, guild => this.worker.guildShard(guild.id).id === x.id).size,
                    state: x.state
                });
            })
        });
    }
};
