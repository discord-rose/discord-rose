import { APIMessage, MessageType } from "discord-api-types"

import { CommandContext } from './CommandContext'

import { CommandOptions, CommandType, CommandContext as ctx, Worker } from '../typings/lib'
import Collection from "@discordjs/collection"

type MiddlewareFunction = (ctx: ctx) => boolean | Promise<boolean>

export class CommandHandler {
  private added: boolean = false
  private _options: CommandHandlerOptions = {
    default: {},
    bots: false,
    mentionPrefix: true
  }

  public middlewares: MiddlewareFunction[] = []
  public commands = {} as Collection<CommandType, CommandOptions>

  constructor (private worker: Worker) {}

  public prefixFunction?: ((message: APIMessage) => Promise<string|string[]> | string|string[])

  /**
   * Sets Command Handler options
   * @param opts Options
   */
  options (opts: CommandHandlerOptions) {
    this._options = opts

    return this
  }
  /**
   * Sets a prefix fetcher
   * @param fn String of prefix or Function to choose prefix with
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
    if (typeof cmd === 'string') return command.toLocaleLowerCase() === cmd.toLocaleLowerCase()
    if (cmd instanceof RegExp) return !!command.match(cmd)

    return false
  }

  private async _exec (data: APIMessage) {
    if (!data.content || (!this._options.bots && data.author.bot)) return
    if (![MessageType.DEFAULT, MessageType.REPLY].includes(data.type)) return

    let prefix: string | string[] | undefined
    if (this.prefixFunction) {
      prefix = await this.prefixFunction(data)
      if (!Array.isArray(prefix)) prefix = [prefix]
      if (this._options.mentionPrefix) prefix.push(`<@${this.worker.user.id}>`, `<@!${this.worker.user.id}>`)
      prefix = prefix.find(x => data.content.startsWith(x))
      if (!prefix) return
    }

    const args = data.content.slice(prefix ? prefix.length : 0).split(/\s/)
    if (args[0] === '') args.shift()
    const command = args.shift() as string

    const cmd = this.commands.find(x => (this._test(command, x.command) || x.aliases?.some(alias => this._test(command, alias)) as boolean))
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
      ctx.embed
        .color(0xFF0000)
        .title('Error')
        .description(err.message)
        .send()

      if (err.nonFatal) return

      err.message += ` (While Running Command: ${command})`
      console.error(err)
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
}