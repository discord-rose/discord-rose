import { APIMessage, MessageType } from "discord-api-types"

import { CommandContext } from './CommandContext'

import { CommandOptions, CommandType, CommandContext as ctx, Worker } from '../typings/lib'
import Collection from "@discordjs/collection"

type MiddlewareFunction = (ctx: ctx) => boolean | Promise<boolean>

interface CommandError extends Error {
  nonFatal: boolean
}

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
  public commands = {} as Collection<CommandType, CommandOptions>

  constructor (private worker: Worker) {}

  public prefixFunction?: ((message: APIMessage) => Promise<string|string[]> | string|string[])
  public errorFunction = (ctx: CommandContext, err: CommandError): void => {
    ctx.embed
      .color(0xFF0000)
      .title('An Error Occured')
      .description(`\`\`\`xl\n${err.message}\`\`\``)
      .send()

    if (err.nonFatal) return

    err.message += ` (While Running Command: ${ctx.command.command})`
    console.error(err)
  }

  /**
   * Sets Command Handler options
   * @param opts Options
   */
  options (opts: CommandHandlerOptions) {
    this._options = {
      ...this._options,
      ...opts
    }

    return this
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
   */
  setPrefix (fn: string|string[] | ((message: APIMessage) => Promise<string|string[]> | string|string[])): this {
    if (Array.isArray(fn) || typeof fn === 'string') {
      this.prefixFunction = () => fn
    } else {
      this.prefixFunction = fn
    }

    return this
  }

  /**
   * Defines an error handler replacing the default one
   * @param fn Function to handle error
   * @example
   * worker.commands
   *  .error((ctx, error) => {
   *    ctx.send(`Error: ${error.message}`)
   *  })
   */
  error (fn: (ctx: CommandContext, error: CommandError) => void) {
    this.errorFunction = fn

    return this
  }

  /**
   * Adds a global middleware function
   * @param fn Middleware function
   */
  middleware (fn: MiddlewareFunction): this {
    this.middlewares.push(fn)

    return this
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
   */
  add (command: CommandOptions): this {
    if (!this.added) {
      this.added = true
      this.commands = new Collection()

      this.worker.on('MESSAGE_CREATE', (data) => this._exec(data))
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

  public findCommand (command: string) {
    return this.commands.find(x => (this._test(command, x.command) || x.aliases?.some(alias => this._test(command, alias)) as boolean))
  }

  private async _exec (data: APIMessage) {
    if (!data.content || (!this._options.bots && data.author.bot)) return
    if (![MessageType.DEFAULT, MessageType.REPLY].includes(data.type)) return

    let prefix: string | string[] | undefined
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

    const command = args.shift() || ''

    const cmd = this.findCommand(command)
    if (!cmd) return

    const ctx = new CommandContext(this.worker, data, cmd, prefix as string)
    ctx.args = args

    try {
      for (const midFn of this.middlewares) {
        try {
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

interface CommandHandlerOptions {
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