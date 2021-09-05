import {CommandContext} from './CommandContext'
import {APIGuildMember, APIMessage, APIChannel, APIUser, APIApplicationCommandInteractionDataOptionWithValues, APIGuildInteraction, APIApplicationCommandInteractionData, InteractionResponseType, APIInteractionResponse, MessageFlags, APIApplicationCommandInteraction, APIInteractionResponseCallbackData} from 'discord-api-types'

import {Embed} from './Embed'
import {MessagesResource, MessageTypes} from '../rest/resources/Messages'

import {CommandOptions, Worker} from '../typings/lib'

import {PermissionsUtils, bits} from '../utils/Permissions'

import {CachedGuild} from '../typings/Discord'
import {CommandError} from './CommandHandler'

export interface InteractionData extends APIApplicationCommandInteractionData {
  options: APIApplicationCommandInteractionDataOptionWithValues[]
}

export interface Interaction extends APIApplicationCommandInteraction {
  data: InteractionData
}

/**
 * Interaction sub-object
 */
export interface InteractionOptions {
  [key: string]: InteractionOptions | undefined | any
}

function formOptions(obj): InteractionOptions {
  const res = {}

  obj?.forEach?.(opt => {
    if (opt.value === undefined) res[opt.name] = formOptions(opt.options)
    else res[opt.name] = opt.value
  })

  return res
}

export class SlashCommandContext implements Omit<CommandContext, 'reply' | 'send' | 'sendFile' | 'embed' | 'args'> {
  /**
   * Whether or not a command is an interaction or not
   */
  isInteraction = true

  async react(): Promise<never> {
    throw new Error('Cannot access ctx.react() since the command was ran as a slash command')
  }

  async delete(): Promise<never> {
    throw new Error('Cannot access ctx.delete() since the command was ran as a slash command')
  }

  get message(): APIMessage {
    throw new Error('Cannot access ctx.message since the command was ran as a slash command')
  }

  /**
   * Command arguments
   */
  public args: Array<InteractionData['options'][number]['value']>
  /**
   * Worker
   */
  public worker: Worker
  /**
   * Message which command was ran with
   */
  public interaction: Interaction
  /**
   * Command options object
   */
  public command: CommandOptions
  /**
   * Prefix command was ran with
   */
  public prefix: string
  /**
   * Actual command that was ran (including possible aliases)
   */
  public ran: string
  /**
   * Interaction options if ran as a slash command
   */
  public options: InteractionOptions = {}

  constructor(opts: {worker: Worker, interaction: Interaction, command: CommandOptions, prefix: string, ran: string, args: SlashCommandContext['args']}) {
    this.worker = opts.worker
    this.interaction = opts.interaction
    this.command = opts.command
    this.prefix = opts.prefix
    this.ran = opts.ran
    this.args = opts.args

    this.options = formOptions(this.interaction.data.options)
  }

  private sent = false

  /**
   * Author of the message
   */
  get author(): APIUser {
    return (this.interaction.member?.user ?? this.interaction.user) as APIUser
  }

  /**
   * Guild where the message was sent
   */
  get guild(): CachedGuild {
    if (!this.interaction.guild_id) throw new Error('Command was not ran in a guild')

    return this.worker.guilds.get(this.interaction.guild_id) as CachedGuild
  }

  /**
   * Channel where the message was sent
   */
  get channel(): APIChannel | undefined {
    return this.worker.channels.get(this.interaction.channel_id)
  }

  /**
   * Member who sent the message
   */
  get member(): APIGuildInteraction['member'] {
    if (!this.interaction.member) throw new Error('Command was not ran in a guild')

    return this.interaction.member
  }

  /**
   * Bot's memeber within the guild
   */
  get me(): APIGuildMember {
    if (!this.interaction.guild_id) throw new Error('Command was not ran in a guild')

    return this.worker.selfMember.get(this.interaction.guild_id) as APIGuildMember
  }

  /**
   * Replies to the invoking message
   * @param data Data for message
   * @returns nothing
   */
  async reply(data: MessageTypes, mention: boolean = false, ephemeral: boolean = false): Promise<null> {
    return await this.send(data, ephemeral)
  }

  private async _callback(data: APIInteractionResponse): Promise<null> {
    this.sent = true

    return await this.worker.api.interactions.callback(this.interaction.id, this.interaction.token, data)
  }

  /**
   * Sends a message in the same channel as invoking message
   * @param data Data for message
   * @returns Message sent
   */
  async send(data: MessageTypes, ephemeral: boolean = false): Promise<null> {
    const message = MessagesResource._formMessage(data, true)
    if (ephemeral) {
      (message as APIInteractionResponseCallbackData).flags = MessageFlags.Ephemeral
    }

    if (this.sent) {
      await this.worker.api.webhooks.editMessage(this.worker.user.id, this.interaction.token, '@original', message)
      return null
    }

    return await this._callback({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: message
    })
  }

  /**
   * Runs an error through sendback of commands.error
   * @param message Message of error
   */
  async error(message: string | Promise<string>): Promise<void> {
    const error = new CommandError(await message)

    error.nonFatal = true

    this.worker.commands.errorFunction(this as unknown as CommandContext, error)
  }

  /**
   * Sends a message to the user who ran the command
   * @param data Data for message
   */
  async dm(data: MessageTypes): Promise<APIMessage> {
    return await this.worker.api.users.dm(this.author.id, data)
  }

  /**
   * Sends a file to the same channel
   * @param file File buffer
   * @param extra Extra message options
   * @returns
   */
  async sendFile(file: {name: string, buffer: Buffer}, extra?: MessageTypes): Promise<null> {
    return await this.worker.api.interactions.callbackFile(this.interaction.id, this.interaction.token, file, extra)
  }

  /**
   * Starts typing in the channel
   */
  async typing(): Promise<null> {
    return await this._callback({
      type: InteractionResponseType.DeferredChannelMessageWithSource
    })
  }

  /**
   * Makes an embed to send
   * @example
   * ctx.embed
   *   .title('Hello')
   *   .send()
   */
  get embed(): Embed<null> {
    return new Embed<null>(async (embed, reply, mention, ephemeral) => {
      if (reply) return await this.reply(embed, mention, ephemeral)
      else return await this.send(embed, ephemeral)
    })
  }

  /**
   * Whether or not the running user has a certain permission
   * @param perms Permission to test
   * @returns
   */
  hasPerms(perms: keyof typeof bits): boolean {
    return PermissionsUtils.has(Number(this.member.permissions), perms)
  }

  /**
   * Whether or not the bot user has a certain permission
   * @param perms Permission to test
   * @returns
   */
  myPerms(perms: keyof typeof bits): boolean {
    if (!this.guild) throw new Error()

    return PermissionsUtils.has(PermissionsUtils.combine({
      guild: this.guild,
      member: this.me,
      overwrites: this.channel?.permission_overwrites,
      roleList: this.worker.guildRoles.get(this.guild.id)
    }), perms)
  }
}
