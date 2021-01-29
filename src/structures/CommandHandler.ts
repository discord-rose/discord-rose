import { APIMessage, MessageType } from "discord-api-types";
import Worker from "../clustering/worker/Worker";

import { CommandContext } from './CommandContext'

interface CommandOptions {
  command: string | RegExp
  exec: (ctx: CommandContext) => void
}

export class CommandHandler {
  private added: boolean = false
  private commands: CommandOptions[]
  constructor (private worker: Worker) {}

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

  private _exec (data: APIMessage) {
    if (!data.content) return
    if (![MessageType.DEFAULT, MessageType.REPLY].includes(data.type)) return

    const cmd = this.commands.find(x => x.command === data.content || x.command instanceof RegExp ? data.content.match(x.command) : false)
    if (!cmd) return

    const ctx = new CommandContext(this.worker, data)

    cmd.exec(ctx)
  }
}