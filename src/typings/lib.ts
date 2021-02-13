import { CommandContext as ctx } from '../structures/CommandContext'
import worker from '../clustering/worker/Worker'

namespace DiscordRose {
  export type CommandType = string | RegExp
  export interface CommandOptions {
    command: CommandType
    aliases?: CommandType[]
    exec: (ctx: CommandContext) => void | Promise<void>
  }
  export interface CommandContext extends ctx {}
  export type Worker = worker
}

export = DiscordRose