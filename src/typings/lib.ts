import { CommandContext as ctx } from '../structures/CommandContext'
import worker from '../clustering/worker/Worker'

namespace DiscordRose {
  export type CommandType = string | RegExp
  export interface CommandOptions {
    /**
     * Command to check for (string or RegExp)
     */
    command: CommandType
    /**
     * Array of extra commands to check
     */
    aliases?: CommandType[]
    /**
     * Execute function
     */
    exec: (ctx: CommandContext) => void | Promise<void>
  }
  export interface CommandContext extends ctx {}
  export type Worker = worker
}

export = DiscordRose