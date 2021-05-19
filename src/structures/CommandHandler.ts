import { APIMessage, InteractionType, MessageType, RESTPostAPIApplicationCommandsJSONBody, Snowflake } from 'discord-api-types'

import { CommandContext } from './CommandContext'

import { CommandOptions, CommandType, Worker, CTX } from '../typings/lib'
import Collection from '@discordjs/collection'

import fs from 'fs'
import path from 'path'
import { Interaction, SlashCommandContext } from './SlashCommandContext'

type MiddlewareFunction = (ctx: CTX) => boolean | Promise<boolean>

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
  private addedInteractions: boolean = false

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
  public SlashCommandContext = SlashCommandContext

  /**
   * Create's new Command Handler
   * @param worker Worker
   */
  constructor (private readonly worker: Worker) {}

  setupInteractions (): void {
    this.addedInteractions = true

    if (this.commands) {
      const interactions = this.commands.filter(x => !!x.interaction)
      if (interactions.size > 0) {
        this.worker.on('INTERACTION_CREATE', (data) => {
          this._interactionExec(data as Interaction).catch(() => {})
        })

        if (this.worker.comms.id !== '0') return

        this.worker.api.interactions.set(interactions.map(x => x.interaction) as RESTPostAPIApplicationCommandsJSONBody[], this.worker.user.id, this._options.interactionGuild)
          .then(() => {
            this.worker.log('Posted command interactions')
          })
          .catch(err => {
            err.message = `${err.message as string} (Whilst posting Command Interactions)`
            console.error(err)
          })
      }
    }
  }

  public prefixFunction?: ((message: APIMessage) => Promise<string|string[]> | string|string[])
  public errorFunction = (ctx: CTX, err: CommandError): void => {
    if (ctx.myPerms('sendMessages')) {
      if (ctx.myPerms('embed')) {
        ctx.embed
          .color(0xFF0000)
          .title('An Error Occured')
          .description(`\`\`\`xl\n${err.message}\`\`\``)
          .send().catch(() => { })
      } else {
        ctx
          .send(`An Error Occured\n\`\`\`xl\n${err.message}\`\`\``)
          .catch(() => { })
      }
    }

    if (err.nonFatal) return

    err.message += ` (While Running Command: ${String(ctx.command.command)})`
    console.error(err)
  }

  /**
   * Load a directory of CommandOptions commands (will also load sub-folders)
   * @param directory Absolute directory full of command files
   */
  load (directory: string): this {
    if (!path.isAbsolute(directory)) directory = path.resolve(process.cwd(), directory)

    const files = fs.readdirSync(directory, { withFileTypes: true })

    files.forEach(file => {
      if (file.isDirectory()) return this.load(path.resolve(directory, file.name))

      if (!file.name.endsWith('.js')) return

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete require.cache[require.resolve(path.resolve(directory, file.name))]

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      let command = require(path.resolve(directory, file.name))

      if (!command) return

      if (command.default) command = command.default

      this.add(command)
    })

    return this
  }

  /**
   * Sets Command Handler options
   * @param opts Options
   * @returns this
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
   * @returns this
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
   * @param fn Function to handle error
   * @example
   * worker.commands
   *  .error((ctx, error) => {
   *    ctx.send(`Error: ${error.message}`)
   *  })
   * @returns this
   */
  error (fn: (ctx: CTX, error: CommandError) => void): this {
    this.errorFunction = fn

    return this
  }

  /**
   * Adds a global middleware function
   * @param fn Middleware function
   * @returns this
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
   * @returns this
   */
  add (command: CommandOptions): this {
    if (!this.added) {
      this.added = true
      this.commands = new Collection()

      this.worker.on('MESSAGE_CREATE', (data) => {
        this._exec(data).catch(() => {})
      })

      this.worker.once('READY', () => {
        this.setupInteractions()
      })
    }
    if (this.worker.comms.id === '0' && this.addedInteractions && command.interaction) {
      void this.worker.api.interactions.update(command.interaction as unknown as RESTPostAPIApplicationCommandsJSONBody, this.worker.user.id, this._options.interactionGuild)
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
   * @param command Command name to fetch
   * @param interaction Whether or not to look for interactions
   * @returns Command
   */
  public find (command: string, interaction?: boolean): CommandOptions | undefined {
    if (interaction) {
      return this.commands?.find(x => x.interaction?.name === command)
    }

    return this.commands?.find(x => (this._test(command, x.command) || x.aliases?.some(alias => this._test(command, alias)) as boolean))
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get findCommand () {
    console.warn('.findCommand is deprecated, please use .find() instead.')

    return this.find
  }

  private async _interactionExec (data: Interaction): Promise<void> {
    if (!data.member) return
    if (data.type === InteractionType.Ping) return

    const cmd = this.find(data.data.name, true) as CommandOptions
    if (!cmd) return

    const ctx = new this.SlashCommandContext({
      worker: this.worker,
      interaction: data,
      command: cmd,
      prefix: '/',
      ran: data.data.name,
      args: data.data.options?.map(x => x.value) ?? []
    })

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
      await cmd.exec(ctx as unknown as CommandContext)
    } catch (err) {
      this.errorFunction(ctx, err)
    }
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

    const ctx = new this.CommandContext({
      worker: this.worker,
      message: data,
      command: cmd,
      prefix,
      ran: command,
      args: args
    })

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
  default?: Partial<Pick<CommandOptions, Exclude<keyof CommandOptions, 'command' | 'exec' | 'aliases'>>>
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
  /**
   * Only post interaction to one specific guild (ID)
   */
  interactionGuild?: Snowflake
}
