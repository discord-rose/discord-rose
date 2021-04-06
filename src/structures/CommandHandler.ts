import { APIMessage, MessageType } from 'discord-api-types'

import { CommandContext } from './CommandContext'

import { CommandOptions, CommandType, CommandContext as ctx, Worker } from '../typings/lib'
import Collection from '@discordjs/collection'

type MiddlewareFunction = (ctx: ctx) => boolean | Promise<boolean>

/**
 * Error in command
 */
export class CommandError extends Error {
  nonFatal?: boolean
}

/**
 * Utility in charge of holding and running commands
 */
export class CommandHandler {
  private added: boolean = false
  private _options: CommandHandlerOptions = {
    default: {},
    bots: false,
    mentionPrefix: true,
    caseInsensitivePrefix: true,
    caseInsensitiveCommand: true
  }

  public middlewares: MiddlewareFunction[] = []
  public commands?: Collection<CommandType, CommandOptions>

  public CommandContext = CommandContext

  /**
   * Create's new Command Handler
   * @param {Worker} worker Worker
   */
  constructor (private readonly worker: Worker) {}

  public prefixFunction?: ((message: APIMessage) => Promise<string|string[]> | string|string[])
  public errorFunction = (ctx: ctx, err: CommandError): void => {
    ctx.embed
      .color(0xFF0000)
      .title('An Error Occured')
      .description(`\`\`\`xl\n${err.message}\`\`\``)
      .send().catch(() => {})

    if (err.nonFatal) return

    err.message += ` (While Running Command: ${String(ctx.command.command)})`
    console.error(err)
  }

  /**
   * Sets Command Handler options
   * @param {CommandHandlerOptions} opts Options
   * @returns {CommandHandler} this
   */
  options (opts: CommandHandlerOptions): this {
    this._options = {
      ...this._options,
      ...opts
    }

    return this
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
  prefix (fn: string|string[] | ((message: APIMessage) => Promise<string|string[]> | string|string[])): this {
    if (Array.isArray(fn) || typeof fn === 'string') {
      this.prefixFunction = () => fn
    } else {
      this.prefixFunction = fn
    }

    return this
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get setPrefix () {
    console.warn('.setPrefix is deprecated, please use .prefix() instead.')

    return this.prefix
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
  error (fn: (ctx: ctx, error: CommandError) => void): this {
    this.errorFunction = fn

    return this
  }

  /**
   * Adds a global middleware function
   * @param {Function} fn Middleware function
   * @returns {CommandHandler} this
   */
  middleware (fn: MiddlewareFunction): this {
    this.middlewares.push(fn)

    return this
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
  add (command: CommandOptions): this {
    if (!this.added) {
      this.added = true
      this.commands = new Collection()

      this.worker.on('MESSAGE_CREATE', (data) => {
        this._exec(data).catch(() => {})
      })
    }
    this.commands?.set(command.command, {
      ...this._options.default,
      ...command
    })

    return this
  }

  private _test (command: string, cmd: CommandType): boolean {
    if (this._options.caseInsensitiveCommand) command = command.toLowerCase()
    if (typeof cmd === 'string') return command === cmd
    if (cmd instanceof RegExp) return !!command.match(cmd)

    return false
  }

  /**
   * Gets a command from registry
   * @param {string} command Command name to fetch
   * @returns {CommandOptions} Command
   */
  public find (command: string): CommandOptions | undefined {
    return this.commands?.find(x => (this._test(command, x.command) || x.aliases?.some(alias => this._test(command, alias)) as boolean))
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get findCommand () {
    console.warn('.findCommand is deprecated, please use .find() instead.')

    return this.find
  }

  private async _exec (data: APIMessage): Promise<void> {
    if (!data.content || (!this._options.bots && data.author.bot)) return
    if (![MessageType.DEFAULT, MessageType.REPLY].includes(data.type)) return

    let prefix: string | string[] | undefined = ''
    if (this.prefixFunction) {
      prefix = await this.prefixFunction(data)
      if (!Array.isArray(prefix)) prefix = [prefix]

      if (this._options.mentionPrefix) prefix.push(`<@${this.worker.user.id}>`, `<@!${this.worker.user.id}>`)

      const content = this._options.caseInsensitivePrefix ? data.content.toLowerCase() : data.content

      prefix = prefix.find(x => content.startsWith(x))
      if (!prefix) return
    }

    const args = data.content.slice(prefix ? prefix.length : 0).split(/\s/)
    if (args[0] === '') {
      args.shift()

      prefix += ' '
    }

    const command = args.shift() ?? ''

    const cmd = this.find(command)
    if (!cmd) return

    const ctx = new this.CommandContext(this.worker, data, cmd, prefix, command)
    ctx.args = args

    try {
      for (const midFn of this.middlewares) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
          if (await midFn(ctx) !== true) return
        } catch (err) {
          err.nonFatal = true

          throw err
        }
      }
      await cmd.exec(ctx)
    } catch (err) {
      this.errorFunction(ctx, err)
    }
  }
}

export interface CommandHandlerOptions {
  /**
   * Default CommandOptions ('command', 'exec', and 'aliases' cannot be defaulted)
   */
  default?: Pick<CommandOptions, Exclude<keyof CommandOptions, 'command' | 'exec' | 'aliases'>>
  /**
   * Allow commands from bots
   * @default false
   */
  bots?: boolean
  /**
   * Whether or not to respond to your bot's @Mention
   * @default true
   */
  mentionPrefix?: boolean
  /**
   * Whether or not the prefix is case insensitive
   * @default true
   */
  caseInsensitivePrefix?: boolean
  /**
   * Whether or not the command is case insensitive
   * @default true
   */
  caseInsensitiveCommand?: boolean
}
