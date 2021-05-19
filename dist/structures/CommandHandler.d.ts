import { APIMessage, Snowflake } from 'discord-api-types';
import { CommandContext } from './CommandContext';
import { CommandOptions, CommandType, Worker, CTX } from '../typings/lib';
import Collection from '@discordjs/collection';
declare type MiddlewareFunction = (ctx: CTX) => boolean | Promise<boolean>;
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
    private addedInteractions;
    private _options;
    middlewares: MiddlewareFunction[];
    commands?: Collection<CommandType, CommandOptions>;
    CommandContext: typeof CommandContext;
    /**
     * Create's new Command Handler
     * @param worker Worker
     */
    constructor(worker: Worker);
    setupInteractions(): void;
    prefixFunction?: ((message: APIMessage) => Promise<string | string[]> | string | string[]);
    errorFunction: (ctx: CTX, err: CommandError) => void;
    /**
     * Load a directory of CommandOptions commands (will also load sub-folders)
     * @param directory Absolute directory full of command files
     */
    load(directory: string): this;
    /**
     * Sets Command Handler options
     * @param opts Options
     * @returns this
     */
    options(opts: CommandHandlerOptions): this;
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
    prefix(fn: string | string[] | ((message: APIMessage) => Promise<string | string[]> | string | string[])): this;
    get setPrefix(): (fn: string | string[] | ((message: APIMessage) => string | string[] | Promise<string | string[]>)) => this;
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
    error(fn: (ctx: CTX, error: CommandError) => void): this;
    /**
     * Adds a global middleware function
     * @param fn Middleware function
     * @returns this
     */
    middleware(fn: MiddlewareFunction): this;
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
    add(command: CommandOptions): this;
    private _test;
    /**
     * Gets a command from registry
     * @param command Command name to fetch
     * @param interaction Whether or not to look for interactions
     * @returns Command
     */
    find(command: string, interaction?: boolean): CommandOptions | undefined;
    get findCommand(): (command: string, interaction?: boolean | undefined) => CommandOptions | undefined;
    private _interactionExec;
    private _exec;
}
export interface CommandHandlerOptions {
    /**
     * Default CommandOptions ('command', 'exec', and 'aliases' cannot be defaulted)
     */
    default?: Partial<Pick<CommandOptions, Exclude<keyof CommandOptions, 'command' | 'exec' | 'aliases'>>>;
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
    /**
     * Only post interaction to one specific guild (ID)
     */
    interactionGuild?: Snowflake;
}
export {};
