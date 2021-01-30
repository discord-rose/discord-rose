import { APIMessage, MessageType } from "discord-api-types";
import Worker from "../clustering/worker/Worker";

import { CommandContext } from './CommandContext'

interface CommandOptions {
  command: string | RegExp
  exec: (ctx: CommandContext, worker: Worker) => void
}

export class CommandHandler {
  private added: boolean = false
  private commands: CommandOptions[]
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

    const cmd = this.commands.find(x => x.command === command || x.command instanceof RegExp ? command.match(x.command) : false)
    if (!cmd) return

    const ctx = new CommandContext(this.worker, data)
    ctx.args = args

    try {
      await cmd.exec(ctx, this.worker)
    } catch (err) {
      ctx.embed
        .color(0xFF0000)
        .title('Error')
        .description(err.message)
        .send()

      err.message += ` (While Running Command: ${command})`
      console.error(err)
    }
  }
}