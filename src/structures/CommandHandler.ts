import { APIMessage, MessageType } from "discord-api-types"

import { CommandContext } from './CommandContext'

import { CommandOptions, CommandType, CommandContext as ctx, Worker } from '../typings/lib'

type MiddlewareFunction = (ctx: ctx) => boolean | Promise<boolean>

export class CommandHandler {
  private added: boolean = false

  public middlewares: MiddlewareFunction[] = []
  public commands: CommandOptions[]

  constructor (private worker: Worker) {}

  public prefixFunction?: (message: APIMessage) => Promise<string> | string

  /**
   * Sets a prefix fetcher
   * @param fn String of prefix or Function to choose prefix with
   */
  setPrefix (fn: string | ((message: APIMessage) => Promise<string> | string)): this {
    if (typeof fn === 'string') {
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
      this.commands = []

      this.worker.on('MESSAGE_CREATE', (data) => this._exec(data))
    }
    this.commands.push(command)

    return this
  }

  private _test (command: string, cmd: CommandType): boolean {
    if (typeof cmd === 'string') return command.toLocaleLowerCase() === cmd.toLocaleLowerCase()
    if (cmd instanceof RegExp) return !!command.match(cmd)

    return false
  }

  private async _exec (data: APIMessage) {
    if (!data.content) return
    if (![MessageType.DEFAULT, MessageType.REPLY].includes(data.type)) return

    let prefix: string
    if (this.prefixFunction) {
      prefix = await this.prefixFunction(data)
      if (!data.content.startsWith(prefix)) return
    }

    const args = data.content.slice(prefix ? prefix.length : 0).split(/\s/)
    const command = args.shift()

    const cmd = this.commands.find(x => this._test(command, x.command) || x.aliases?.some(alias => this._test(command, alias)))
    if (!cmd) return

    const ctx = new CommandContext(this.worker, data, cmd, prefix)
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