"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestManager = void 0;
const node_fetch_1 = __importStar(require("node-fetch"));
const qs = __importStar(require("querystring"));
const cache_1 = require("@jpbberry/cache");
const Bucket_1 = require("./Bucket");
const Channels_1 = require("./resources/Channels");
const Messages_1 = require("./resources/Messages");
const Guilds_1 = require("./resources/Guilds");
const Members_1 = require("./resources/Members");
const Users_1 = require("./resources/Users");
const Misc_1 = require("./resources/Misc");
const Webhooks_1 = require("./resources/Webhooks");
/**
 * The base rest handler for all things Discord rest
 */
class RestManager {
    constructor(token, options = {}) {
        var _a;
        this.token = token;
        this.buckets = new cache_1.Cache(60000);
        this.global = null;
        /**
         * Channel resource
         * @type {ChannelsResource}
         */
        this.channels = new Channels_1.ChannelsResource(this);
        /**
         * Messages resource
         * @type {MessagesResource}
         */
        this.messages = new Messages_1.MessagesResource(this);
        /**
         * Guilds resource
         * @type {GuildsResource}
         */
        this.guilds = new Guilds_1.GuildsResource(this);
        /**
         * Members resource
         * @type {MembersResource}
         */
        this.members = new Members_1.MembersResource(this);
        /**
         * Users resource
         * @type {UsersResource}
         */
        this.users = new Users_1.UsersResource(this);
        /**
         * Misc resource
         * @type {MiscResource}
         */
        this.misc = new Misc_1.MiscResource(this);
        /**
         * Webhooks resource
         * @type {WebhooksResource}
         */
        this.webhooks = new Webhooks_1.WebhooksResource(this);
        this.options = {
            version: (_a = options.version) !== null && _a !== void 0 ? _a : 8
        };
    }
    _key(route) {
        const bucket = [];
        const split = route.split('/');
        for (let i = 0; i < split.length; i++) {
            if (split[i - 1] === 'reactions')
                break;
            if (/\d{16,19}/g.test(split[i]) && !/channels|guilds/.test(split[i - 1]))
                bucket.push(':id');
            else
                bucket.push(split[i]);
        }
        return bucket.join('-');
    }
    /**
     * Make a custom request
     * @param method Method
     * @param route Route, e.g "/users/123"
     * @param options Other options
     */
    async request(method, route, options = {}) {
        return await new Promise((resolve, reject) => {
            const key = this._key(route);
            let bucket = this.buckets.get(key);
            if (!bucket) {
                bucket = new Bucket_1.Bucket(key, this);
                this.buckets.set(key, bucket);
            }
            bucket.add({ method, route, options, resolve, reject });
        });
    }
    /**
     * @internal
     */
    async make(opts) {
        var _a;
        const method = opts.method;
        const route = opts.route;
        const options = opts.options;
        const headers = new node_fetch_1.Headers();
        if (this.token)
            headers.set('Authorization', `Bot ${this.token}`);
        if (options.body)
            headers.set('Content-Type', 'application/json');
        if (options.reason)
            headers.set('X-Audit-Log-Reason', options.reason);
        headers.set('User-Agent', 'DiscordBot (Discord-Rose, v0)');
        if (options.headers) {
            Object.keys(options.headers).forEach(key => {
                var _a;
                headers.set(key, (_a = options.headers) === null || _a === void 0 ? void 0 : _a[key]);
            });
        }
        const res = await node_fetch_1.default(`https://discord.com/api/v${this.options.version}${route}${options.query ? `?${qs.stringify(options.query)}` : ''}`, {
            method, headers,
            body: options.body ? ((_a = options.parser) !== null && _a !== void 0 ? _a : JSON.stringify)(options.body) : undefined
        });
        const json = res.status === 204 ? null : await res.json();
        return { res, json };
    }
}
exports.RestManager = RestManager;
