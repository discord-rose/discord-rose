"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
exports.handlers = {
    REGISTER_SHARD: function ({ id }, respond) {
        var _a;
        (_a = this.sharder) === null || _a === void 0 ? void 0 : _a.register(id);
        this.debug(`Registered shard ${id}`);
        respond({});
    },
    SHARD_READY: async function ({ id }, _) {
        this.log(`Shard ${id} connected to Discord`);
    },
    LOG: function (data, _) {
        this.log(data);
    },
    DEBUG: function (msg) {
        this.debug(msg);
    },
    RESTART_CLUSTER: function ({ id }, _) {
        console.warn('RESTART_CLUSTER is being used in Singleton mode, process.exit()ing');
        process.exit();
    },
    RESTART_SHARD: function ({ id }, _) {
        var _a;
        (_a = this.shards.get(id)) === null || _a === void 0 ? void 0 : _a.restart(true);
    },
    GET_GUILD: async function ({ id }, respond) {
        var _a, _b;
        const guild = this.guilds.get(id);
        if (!guild)
            return respond({ error: 'Not in guild' });
        if (this.guildRoles) {
            guild.roles = (_b = (_a = this.guildRoles.get(guild.id)) === null || _a === void 0 ? void 0 : _a.array()) !== null && _b !== void 0 ? _b : [];
        }
        if (this.channels) {
            guild.channels = this.channels.filter(x => x.guild_id === guild.id).array();
        }
        respond(guild);
    },
    BROADCAST_EVAL: async function (code, respond) {
        respond({ error: 'BROADCAST_EVAL cannot be used in Singleton mode' });
    },
    MASTER_EVAL: async function (code, respond) {
        respond === null || respond === void 0 ? void 0 : respond({ error: 'MASTER_EVAL cannot be used in Singleton mode' });
    },
    SEND_WEBHOOK: async function ({ id, token, data }, respond) {
        respond(await this.api.webhooks.send(id, token, data));
    },
    STATS: async function (_, respond) {
        respond([{
                cluster: {
                    id: this.comms.id,
                    memory: process.memoryUsage().heapTotal,
                    uptime: process.uptime()
                },
                shards: this.shards.map(x => {
                    var _a, _b;
                    return ({
                        id: x.id,
                        ping: x.ping,
                        guilds: (_b = (_a = this.guilds).filter) === null || _b === void 0 ? void 0 : _b.call(_a, guild => this.guildShard(guild.id).id === x.id).size,
                        state: x.state
                    });
                })
            }]);
    }
};
