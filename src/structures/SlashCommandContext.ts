import { CommandContext } from './CommandContext'
import { APIGuildMember, APIMessage, APIChannel, APIUser, APIApplicationCommandInteractionDataOptionWithValues, APIGuildInteraction, APIApplicationCommandInteractionData, InteractionResponseType, APIInteractionApplicationCommandCallbackData } from 'discord-api-types'

import { Embed } from './Embed'
import { MessageTypes } from '../rest/resources/Messages'

import { CommandOptions, Worker } from '../typings/lib'

import { PermissionsUtils, bits } from '../utils/Permissions'

import { CachedGuild } from '../typings/Discord'
import { CommandError } from './CommandHandler'

export interface InteractionData extends APIApplicationCommandInteractionData {
  options: APIApplicationCommandInteractionDataOptionWithValues[]
}

export interface Interaction extends APIGuildInteraction {
  data: InteractionData
}

export class SlashCommandContext implements Omit<CommandContext, 'reply' | 'send' | 'sendFile' | 'embed' | 'args'> {
  /**
   * Whether or not a command is an interaction or not
   */
  isInteraction = true

  async react (): Promise<never> {
    throw new Error('Cannot access ctx.react() since the command was ran as a slash command')
  }

  async delete (): Promise<never> {
    throw new Error('Cannot access ctx.delete() since the command was ran as a slash command')
  }

  get message (): APIMessage {
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

  constructor (opts: { worker: Worker, interaction: Interaction, command: CommandOptions, prefix: string, ran: string, args: SlashCommandContext['args'] }) {
    this.worker = opts.worker
    this.interaction = opts.interaction
    this.command = opts.command
    this.prefix = opts.prefix
    this.ran = opts.ran
    this.args = opts.args
  }

  /**
   * Author of the message
   */
  get author (): APIUser {
    return this.interaction.member.user
  }

  /**
   * Guild where the message was sent
   */
  get guild (): CachedGuild | undefined {
    return this.worker.guilds.get(this.interaction.guild_id)
  }

  /**
   * Channel where the message was sent
   */
  get channel (): APIChannel | undefined {
    return this.worker.channels.get(this.interaction.channel_id)
  }

  /**
   * Member who sent the message
   */
  get member (): APIGuildInteraction['member'] {
    return this.interaction.member
  }

  /**
   * Bot's memeber within the guild
   */
  get me (): APIGuildMember {
    return this.worker.selfMember.get(this.interaction.guild_id) as APIGuildMember
  }

  /**
   * Replies to the invoking message
   * @param data Data for message
   * @returns nothing
   */
  async reply (data: MessageTypes): Promise<null> {
    return await this.send(data)
  }

  /**
   * Sends a message in the same channel as invoking message
   * @param data Data for message
   * @returns Message sent
   */
  async send (data: MessageTypes): Promise<null> {
    return await this.worker.api.interactions.callback(this.interaction.id, this.interaction.token, {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: data as APIInteractionApplicationCommandCallbackData
    })
  }

  /**
   * Runs an error through sendback of commands.error
   * @param message Message of error
   */
  async error (message: string | Promise<string>): Promise<void> {
    const error = new CommandError(await message)

    error.nonFatal = true

    this.worker.commands.errorFunction(this, error)
  }

  /**
   * Sends a message to the user who ran the command
   * @param data Data for message
   */
  async dm (data: MessageTypes): Promise<APIMessage> {
    return await this.worker.api.users.dm(this.author.id, data)
  }

  /**
   * Sends a file to the same channel
   * @param file File buffer
   * @param extra Extra message options
   * @returns
   */
  async sendFile (file: { name: string, buffer: Buffer }, extra?: MessageTypes): Promise<null> {
    return await this.worker.api.interactions.callbackFile(this.interaction.id, this.interaction.token, file, extra)
  }

  /**
   * Starts typing in the channel
   */
  async typing (): Promise<never> {
    return await this.worker.api.interactions.callback(this.interaction.id, this.interaction.token, {
      type: InteractionResponseType.DeferredChannelMessageWithSource
    }) as never
  }

  /**
   * Makes an embed to send
   * @example
   * ctx.embed
   *   .title('Hello')
   *   .send()
   */
  get embed (): Embed<null> {
    return new Embed<null>(async (embed, reply, _mention) => {
      if (reply) return await this.reply(embed)
      else return await this.send(embed)
    })
  }

  /**
   * Whether or not the running user has a certain permission
   * @param perms Permission to test
   * @returns
   */
  hasPerms (perms: keyof typeof bits): boolean {
    if (!this.guild) throw new Error('Missing guild')

    return PermissionsUtils.has(Number(this.member.permissions), perms)
  }

  /**
   * Whether or not the bot user has a certain permission
   * @param perms Permission to test
   * @returns
   */
  myPerms (perms: keyof typeof bits): boolean {
    if (!this.guild) throw new Error()

    return PermissionsUtils.has(PermissionsUtils.combine({
      guild: this.guild,
      member: this.me,
      overwrites: this.channel?.permission_overwrites,
      roleList: this.worker.guildRoles.get(this.guild.id)
    }), perms)
  }
}
