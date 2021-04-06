import { APIMessage } from 'discord-api-types';
import { CommandContext } from './CommandContext';
import { CommandOptions, CommandType, CommandContext as ctx, Worker } from '../typings/lib';
import Collection from '@discordjs/collection';
declare type MiddlewareFunction = (ctx: ctx) => boolean | Promise<boolean>;
/**
 * Error in command
 */
export declare class CommandError extends Error {
    nonFatal?: boolean;
}
/**
 * Utility in charge of holding and running commands
 */
export declare class CommandHandler {
    private readonly worker;
    private added;
    private _options;
    middlewares: MiddlewareFunction[];
    commands?: Collection<CommandType, CommandOptions>;
    CommandContext: typeof CommandContext;
    /**
     * Create's new Command Handler
     * @param {Worker} worker Worker
     */
    constructor(worker: Worker);
    prefixFunction?: ((message: APIMessage) => Promise<string | string[]> | string | string[]);
    errorFunction: (ctx: ctx, err: CommandError) => void;
    /**
     * Sets Command Handler options
     * @param {CommandHandlerOptions} opts Options
     * @returns {CommandHandler} this
     */
    options(opts: CommandHandlerOptions): this;
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
    prefix(fn: string | string[] | ((message: APIMessage) => Promise<string | string[]> | string | string[])): this;
    get setPrefix(): (fn: string | string[] | ((message: APIMessage) => string | string[] | Promise<string | string[]>)) => this;
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
    error(fn: (ctx: ctx, error: CommandError) => void): this;
    /**
     * Adds a global middleware function
     * @param {Function} fn Middleware function
     * @returns {CommandHandler} this
     */
    middleware(fn: MiddlewareFunction): this;
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
    add(command: CommandOptions): this;
    private _test;
    /**
     * Gets a command from registry
     * @param {string} command Command name to fetch
     * @returns {CommandOptions} Command
     */
    find(command: string): CommandOptions | undefined;
    get findCommand(): (command: string) => CommandOptions | undefined;
    private _exec;
}
interface CommandHandlerOptions {
    /**
     * Default CommandOptions ('command', 'exec', and 'aliases' cannot be defaulted)
     */
    default?: Pick<CommandOptions, Exclude<keyof CommandOptions, 'command' | 'exec' | 'aliases'>>;
    /**
     * Allow commands from bots
     * @default false
     */
    bots?: boolean;
    /**
     * Whether or not to respond to your bot's @Mention
     * @default true
     */
    mentionPrefix?: boolean;
    /**
     * Whether or not the prefix is case insensitive
     * @default true
     */
    caseInsensitivePrefix?: boolean;
    /**
     * Whether or not the command is case insensitive
     * @default true
     */
    caseInsensitiveCommand?: boolean;
}
export {};
