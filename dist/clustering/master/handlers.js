"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
exports.handlers = {
    REGISTER_SHARD: function ({ id }, respond) {
        this.master.sharder.register(id);
        this.logAs(`Registered shard ${id}`);
        respond({});
    },
    SHARD_READY: function ({ id }, _) {
        this.logAs(`Shard ${id} connected to Discord`);
        if (!this.master.spawned) {
            if (this.master.sharder.buckets.every(x => x === null))
                this.master.emit('READY', this.master);
        }
    },
    LOG: function (data, _) {
        this.logAs(data);
    },
    RESTART_CLUSTER: function ({ id }, _) {
        var _a;
        (_a = this.master.processes.get(String(id))) === null || _a === void 0 ? void 0 : _a.restart();
    },
    RESTART_SHARD: function ({ id }, _) {
        var _a;
        (_a = this.master.shardToCluster(id)) === null || _a === void 0 ? void 0 : _a.restartShard(id);
    },
    GET_GUILD: async function ({ id }, respond) {
        var _a, _b;
        respond((_b = await ((_a = this.master.guildToCluster(id)) === null || _a === void 0 ? void 0 : _a.getGuild(id))) !== null && _b !== void 0 ? _b : { error: 'Not In Guild' });
    },
    BROADCAST_EVAL: async function (code, respond) {
        respond(await this.master.broadcastEval(code));
    },
    MASTER_EVAL: async function (code, respond) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const master = this.master;
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
    SEND_WEBHOOK: async function ({ id, token, data }, respond) {
        respond(await this.master.rest.webhooks.send(id, token, data));
    },
    STATS: async function (_, respond) {
        respond(await this.master.getStats());
    }
};
