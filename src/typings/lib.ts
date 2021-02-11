import { CommandContext } from '../structures/CommandContext'

declare namespace DiscordRose {
  export type CommandType = string | RegExp
  export interface CommandOptions {
    command: CommandType
    aliases?: CommandType[]
    exec: (ctx: CommandContext) => void | Promise<void>
  }
}

export = DiscordRose