import { CommandContext as ctx } from '../structures/CommandContext'
import { Worker as worker } from '../clustering/worker/Worker'
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types'
import { SlashCommandContext } from '../structures/SlashCommandContext'

// eslint-disable-next-line @typescript-eslint/no-namespace
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
     * Slash command interaction data that posts on startup
     */
    interaction?: RESTPostAPIApplicationCommandsJSONBody
    /**
     * Execute function
     */
    exec: (ctx: CommandContext) => void | Promise<void>
  }
  export interface CommandContext extends ctx {}
  export type Worker = worker

  export type CTX = DiscordRose.CommandContext | SlashCommandContext
}

export = DiscordRose
