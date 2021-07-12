"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = exports.CommandError = void 0;
const CommandContext_1 = require("./CommandContext");
const UtilityFunctions_1 = require("../utils/UtilityFunctions");
const collection_1 = __importDefault(require("@discordjs/collection"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SlashCommandContext_1 = require("./SlashCommandContext");
const Pieces_1 = __importDefault(require("../utils/Pieces"));
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
     * @param worker Worker
     */
    constructor(worker) {
        this.worker = worker;
        this.added = false;
        this.addedInteractions = false;
        this._options = {
            default: {},
            bots: false,
            mentionPrefix: true,
            caseInsensitivePrefix: true,
            caseInsensitiveCommand: true,
            reuseInteractions: true
        };
        this.middlewares = [];
        this.CommandContext = CommandContext_1.CommandContext;
        this.SlashCommandContext = SlashCommandContext_1.SlashCommandContext;
        this.errorFunction = (ctx, err) => {
            if (ctx.myPerms('sendMessages')) {
                if (ctx.isInteraction || ctx.myPerms('embed')) {
                    ctx.embed
                        .color(0xFF0000)
                        .title('An Error Occured')
                        .description(`\`\`\`xl\n${err.message}\`\`\``)
                        .send(true, false, true).catch(console.error);
                }
                else {
                    ctx
                        .send(`An Error Occured\n\`\`\`xl\n${err.message}\`\`\``)
                        .catch(() => { });
                }
            }
            if (err.nonFatal)
                return;
            err.message += ` (While Running Command: ${String(ctx.command.command)})`;
            console.error(err);
        };
    }
    async setupInteractions() {
        this.addedInteractions = true;
        if (this.commands) {
            const interactions = this.commands.filter(x => !!x.interaction);
            if (interactions.size > 0) {
                this.worker.on('INTERACTION_CREATE', (data) => {
                    this._interactionExec(data).catch(() => { });
                });
                if (this.worker.comms.id !== '0')
                    return;
                if (this._options.reuseInteractions) {
                    const currentInteractions = await this.worker.api.interactions.get(this.worker.user.id, this._options.interactionGuild);
                    const newInteractions = interactions.filter(command => !currentInteractions.find(interaction => { var _a; return ((_a = command.interaction) === null || _a === void 0 ? void 0 : _a.name) === interaction.name; }));
                    const deletedInteractions = currentInteractions.filter(interaction => !interactions.find(command => { var _a; return interaction.name === ((_a = command.interaction) === null || _a === void 0 ? void 0 : _a.name); }));
                    const changedInteractions = interactions.filter(command => {
                        if (command.interaction) {
                            command.interaction.default_permission = typeof command.interaction.default_permission === 'boolean' ? command.interaction.default_permission : true;
                            UtilityFunctions_1.traverseObject(command.interaction, obj => {
                                if (typeof obj.required === 'boolean' && !obj.required)
                                    delete obj.required;
                            });
                        }
                        return !currentInteractions.find(interaction => {
                            var _a, _b, _c, _d;
                            const current = Pieces_1.default.generate((_a = command.interaction) === null || _a === void 0 ? void 0 : _a.options);
                            const incoming = Pieces_1.default.generate(interaction === null || interaction === void 0 ? void 0 : interaction.options);
                            return interaction.default_permission === ((_b = command.interaction) === null || _b === void 0 ? void 0 : _b.default_permission) &&
                                interaction.description === ((_c = command.interaction) === null || _c === void 0 ? void 0 : _c.description) &&
                                interaction.name === ((_d = command.interaction) === null || _d === void 0 ? void 0 : _d.name) &&
                                Object.keys(current).every(x => current[x] === incoming[x]);
                        }) && !newInteractions.find(newCommand => newCommand === command);
                    });
                    const promises = [];
                    newInteractions.forEach(command => promises.push(this.worker.api.interactions.add(command.interaction, this.worker.user.id, this._options.interactionGuild)));
                    deletedInteractions.forEach(interaction => promises.push(this.worker.api.interactions.delete(interaction.id, this.worker.user.id, this._options.interactionGuild)));
                    changedInteractions.forEach(command => promises.push(this.worker.api.interactions.add(command.interaction, this.worker.user.id, this._options.interactionGuild)));
                    Promise.all(promises)
                        .then(() => {
                        this.worker.log(`Added ${newInteractions.size}, deleted ${deletedInteractions.length}, and updated ${changedInteractions.size} command interactions`);
                    })
                        .catch(err => {
                        err.message = `${err.message} (Whilst posting Command Interactions)`;
                        console.error(err);
                    });
                }
                else {
                    this.worker.api.interactions.set(interactions.map(x => x.interaction), this.worker.user.id, this._options.interactionGuild)
                        .then(() => {
                        this.worker.log('Posted command interactions');
                    })
                        .catch(err => {
                        err.message = `${err.message} (Whilst posting Command Interactions)`;
                        console.error(err);
                    });
                }
            }
        }
    }
    /**
     * Load a directory of CommandOptions commands (will also load sub-folders)
     * @param directory Absolute directory full of command files
     */
    load(directory) {
        if (!path_1.default.isAbsolute(directory))
            directory = path_1.default.resolve(process.cwd(), directory);
        const files = fs_1.default.readdirSync(directory, { withFileTypes: true });
        files.forEach(file => {
            if (file.isDirectory())
                return this.load(path_1.default.resolve(directory, file.name));
            if (!file.name.endsWith('.js'))
                return;
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete require.cache[require.resolve(path_1.default.resolve(directory, file.name))];
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            let command = require(path_1.default.resolve(directory, file.name));
            if (!command)
                return;
            if (command.default)
                command = command.default;
            this.add(command);
        });
        return this;
    }
    /**
     * Sets Command Handler options
     * @param opts Options
     * @returns this
     */
    options(opts) {
        this._options = Object.assign(Object.assign({}, this._options), opts);
        return this;
    }
    /**
     * Sets a prefix fetcher
     * @param fn String of prefix or Function to choose prefix with
     * @example
     * worker.commands
     *   .setPrefix('!')
     * // or
     *   .setPrefix(['!', '+'])
     * // or
     *   .setPrefix((message) => {
     *     return db.getPrefix(message.guild_id)
     *   })
     * @returns this
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
     * @param fn Function to handle error
     * @example
     * worker.commands
     *  .error((ctx, error) => {
     *    ctx.send(`Error: ${error.message}`)
     *  })
     * @returns this
     */
    error(fn) {
        this.errorFunction = fn;
        return this;
    }
    /**
     * Adds a global middleware function
     * @param fn Middleware function
     * @returns this
     */
    middleware(fn) {
        this.middlewares.push(fn);
        return this;
    }
    /**
     * Adds a command to the command handler
     * @param command Command data, be sure to add exec() and command:
     * @example
     * worker.commands
     *   .add({
     *     command: 'hello',
     *     exec: (ctx) => {
     *       ctx.reply('World!')
     *     }
     *   })
     * @returns this
     */
    add(command) {
        var _a;
        if (!this.added) {
            this.added = true;
            this.commands = new collection_1.default();
            this.worker.on('MESSAGE_CREATE', (data) => {
                this._exec(data).catch(() => { });
            });
            this.worker.once('READY', () => {
                void this.setupInteractions();
            });
        }
        if (this.worker.comms.id === '0' && this.addedInteractions && command.interaction) {
            this.worker.api.interactions.add(command.interaction, this.worker.user.id, this._options.interactionGuild)
                .catch(err => {
                err.message = `${err.message} (Whilst posting a Command Interaction)`;
                console.error(err);
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
     * @param command Command name to fetch
     * @param interaction Whether or not to look for interactions
     * @returns Command
     */
    find(command, interaction) {
        var _a, _b;
        if (interaction) {
            return (_a = this.commands) === null || _a === void 0 ? void 0 : _a.find(x => !!x.interaction && x.interaction.name === command);
        }
        return (_b = this.commands) === null || _b === void 0 ? void 0 : _b.find(x => { var _a; return (this._test(command, x.command) || ((_a = x.aliases) === null || _a === void 0 ? void 0 : _a.some(alias => this._test(command, alias)))); });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    get findCommand() {
        console.warn('.findCommand is deprecated, please use .find() instead.');
        return this.find;
    }
    async _interactionExec(data) {
        var _a, _b;
        if (!data.member)
            return;
        if (data.type === 1 /* Ping */)
            return;
        const cmd = this.find(data.data.name, true);
        if (!cmd)
            return;
        const ctx = new this.SlashCommandContext({
            worker: this.worker,
            interaction: data,
            command: cmd,
            prefix: '/',
            ran: data.data.name,
            args: (_b = (_a = data.data.options) === null || _a === void 0 ? void 0 : _a.map(x => x.value)) !== null && _b !== void 0 ? _b : []
        });
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
    async _exec(data) {
        var _a;
        if (!data.content || (!this._options.bots && data.author.bot))
            return;
        if (![0 /* Default */, 19 /* Reply */].includes(data.type))
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
        const ctx = new this.CommandContext({
            worker: this.worker,
            message: data,
            command: cmd,
            prefix,
            ran: command,
            args: args
        });
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
