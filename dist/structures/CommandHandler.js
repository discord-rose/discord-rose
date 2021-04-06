"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = exports.CommandError = void 0;
const CommandContext_1 = require("./CommandContext");
const collection_1 = __importDefault(require("@discordjs/collection"));
/**
 * Error in command
 */
class CommandError extends Error {
}
exports.CommandError = CommandError;
/**
 * Utility in charge of holding and running commands
 */
class CommandHandler {
    /**
     * Create's new Command Handler
     * @param {Worker} worker Worker
     */
    constructor(worker) {
        this.worker = worker;
        this.added = false;
        this._options = {
            default: {},
            bots: false,
            mentionPrefix: true,
            caseInsensitivePrefix: true,
            caseInsensitiveCommand: true
        };
        this.middlewares = [];
        this.CommandContext = CommandContext_1.CommandContext;
        this.errorFunction = (ctx, err) => {
            ctx.embed
                .color(0xFF0000)
                .title('An Error Occured')
                .description(`\`\`\`xl\n${err.message}\`\`\``)
                .send().catch(() => { });
            if (err.nonFatal)
                return;
            err.message += ` (While Running Command: ${String(ctx.command.command)})`;
            console.error(err);
        };
    }
    /**
     * Sets Command Handler options
     * @param {CommandHandlerOptions} opts Options
     * @returns {CommandHandler} this
     */
    options(opts) {
        this._options = Object.assign(Object.assign({}, this._options), opts);
        return this;
    }
    /**
     * Sets a prefix fetcher
     * @param {Function} fn String of prefix or Function to choose prefix with
     * @example
     * worker.commands
     *   .setPrefix('!')
     * // or
     *   .setPrefix(['!', '+'])
     * // or
     *   .setPrefix((message) => {
     *     return db.getPrefix(message.guild_id)
     *   })
     * @returns {CommandHandler} this
     */
    prefix(fn) {
        if (Array.isArray(fn) || typeof fn === 'string') {
            this.prefixFunction = () => fn;
        }
        else {
            this.prefixFunction = fn;
        }
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    get setPrefix() {
        console.warn('.setPrefix is deprecated, please use .prefix() instead.');
        return this.prefix;
    }
    /**
     * Defines an error handler replacing the default one
     * @param {Function} fn Function to handle error
     * @example
     * worker.commands
     *  .error((ctx, error) => {
     *    ctx.send(`Error: ${error.message}`)
     *  })
     * @returns {CommandHandler} this
     */
    error(fn) {
        this.errorFunction = fn;
        return this;
    }
    /**
     * Adds a global middleware function
     * @param {Function} fn Middleware function
     * @returns {CommandHandler} this
     */
    middleware(fn) {
        this.middlewares.push(fn);
        return this;
    }
    /**
     * Adds a command to the command handler
     * @param {CommandOptions} command Command data, be sure to add exec() and command:
     * @example
     * worker.commands
     *   .add({
     *     command: 'hello',
     *     exec: (ctx) => {
     *       ctx.reply('World!')
     *     }
     *   })
     * @returns {CommandHandler} this
     */
    add(command) {
        var _a;
        if (!this.added) {
            this.added = true;
            this.commands = new collection_1.default();
            this.worker.on('MESSAGE_CREATE', (data) => {
                this._exec(data).catch(() => { });
            });
        }
        (_a = this.commands) === null || _a === void 0 ? void 0 : _a.set(command.command, Object.assign(Object.assign({}, this._options.default), command));
        return this;
    }
    _test(command, cmd) {
        if (this._options.caseInsensitiveCommand)
            command = command.toLowerCase();
        if (typeof cmd === 'string')
            return command === cmd;
        if (cmd instanceof RegExp)
            return !!command.match(cmd);
        return false;
    }
    /**
     * Gets a command from registry
     * @param {string} command Command name to fetch
     * @returns {CommandOptions} Command
     */
    find(command) {
        var _a;
        return (_a = this.commands) === null || _a === void 0 ? void 0 : _a.find(x => { var _a; return (this._test(command, x.command) || ((_a = x.aliases) === null || _a === void 0 ? void 0 : _a.some(alias => this._test(command, alias)))); });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    get findCommand() {
        console.warn('.findCommand is deprecated, please use .find() instead.');
        return this.find;
    }
    async _exec(data) {
        var _a;
        if (!data.content || (!this._options.bots && data.author.bot))
            return;
        if (![0 /* DEFAULT */, 19 /* REPLY */].includes(data.type))
            return;
        let prefix = '';
        if (this.prefixFunction) {
            prefix = await this.prefixFunction(data);
            if (!Array.isArray(prefix))
                prefix = [prefix];
            if (this._options.mentionPrefix)
                prefix.push(`<@${this.worker.user.id}>`, `<@!${this.worker.user.id}>`);
            const content = this._options.caseInsensitivePrefix ? data.content.toLowerCase() : data.content;
            prefix = prefix.find(x => content.startsWith(x));
            if (!prefix)
                return;
        }
        const args = data.content.slice(prefix ? prefix.length : 0).split(/\s/);
        if (args[0] === '') {
            args.shift();
            prefix += ' ';
        }
        const command = (_a = args.shift()) !== null && _a !== void 0 ? _a : '';
        const cmd = this.find(command);
        if (!cmd)
            return;
        const ctx = new this.CommandContext(this.worker, data, cmd, prefix, command);
        ctx.args = args;
        try {
            for (const midFn of this.middlewares) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                    if (await midFn(ctx) !== true)
                        return;
                }
                catch (err) {
                    err.nonFatal = true;
                    throw err;
                }
            }
            await cmd.exec(ctx);
        }
        catch (err) {
            this.errorFunction(ctx, err);
        }
    }
}
exports.CommandHandler = CommandHandler;
