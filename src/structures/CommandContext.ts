import { APIGuildMember, APIMessage, APIChannel, Snowflake, APIUser } from 'discord-api-types'

import { Embed } from './Embed'
import { MessageTypes, MessagesResource, Emoji } from '../rest/resources/Messages'

import { CommandOptions, Worker } from '../typings/lib'

import { PermissionsUtils, bits } from '../utils/Permissions'

import { CachedGuild } from '../typings/Discord'
import { CommandError } from './CommandHandler'

/**
 * Context holding all information about a ran command and utility functions
 */
export class CommandContext {
  /**
   * Command arguments
   */
  public args: string[]
  /**
   * Worker
   */
  public worker: Worker
  /**
   * Message which command was ran with
   */
  public message: APIMessage
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

  constructor (opts: { worker: Worker, message: APIMessage, command: CommandOptions, prefix: string, ran: string, args: string[] }) {
    this.worker = opts.worker
    this.message = opts.message
    this.command = opts.command
    this.prefix = opts.prefix
    this.ran = opts.ran
    this.args = opts.args
  }

  /**
   * Author of the message
   */
  get author (): APIUser {
    return this.message.author
  }

  /**
   * Guild where the message was sent
   */
  get guild (): CachedGuild | undefined {
    return this.worker.guilds.get(this.message.guild_id as Snowflake)
  }

  /**
   * Channel where the message was sent
   */
  get channel (): APIChannel | undefined {
    return this.worker.channels.get(this.message.channel_id)
  }

  /**
   * Member who sent the message
   */
  get member (): APIGuildMember {
    const mem = Object.assign({ user: this.message.author }, this.message.member)

    return mem
  }

  /**
   * Bot's memeber within the guild
   */
  get me (): APIGuildMember {
    return this.worker.selfMember.get(this.message.guild_id as Snowflake) as APIGuildMember
  }

  /**
   * Replies to the invoking message
   * @param data Data for message
   * @param mention Whether or not to mention the user in the reply (defaults to false)
   * @returns Message sent
   */
  async reply (data: MessageTypes, mention = false): Promise<APIMessage> {
    if (!mention) {
      data = MessagesResource._formMessage(data)
      if (!data.allowed_mentions) data.allowed_mentions = {}
      data.allowed_mentions.replied_user = false
    }

    return await this.worker.api.messages.send(this.message.channel_id, data, {
      message_id: this.message.id,
      channel_id: this.message.channel_id,
      guild_id: this.message.guild_id
    })
  }

  /**
   * Sends a message in the same channel as invoking message
   * @param data Data for message
   * @returns Message sent
   */
  async send (data: MessageTypes): Promise<APIMessage> {
    return await this.worker.api.messages.send(this.message.channel_id, data)
  }

  /**
   * React to the invoking command message
   * @param emoji ID of custom emoji or unicode emoji
   */
  async react (emoji: Emoji): Promise<never> {
    return await this.worker.api.messages.react(this.message.channel_id, this.message.id, emoji)
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
    return await this.worker.api.users.dm(this.message.author.id, data)
  }

  /**
   * Sends a file to the same channel
   * @param file File buffer
   * @param extra Extra message options
   * @returns
   */
  async sendFile (file: { name: string, buffer: Buffer }, extra?: MessageTypes): Promise<APIMessage> {
    return await this.worker.api.messages.sendFile(this.message.channel_id, file, extra)
  }

  /**
   * Starts typing in the channel
   */
  async typing (): Promise<never> {
    return await this.worker.api.channels.typing(this.message.channel_id)
  }

  /**
   * Deletes the invoking message
   */
  async delete (): Promise<never> {
    return await this.worker.api.messages.delete(this.message.channel_id, this.message.id)
  }

  /**
   * Makes an embed to send
   * @example
   * ctx.embed
   *   .title('Hello')
   *   .send()
   */
  get embed (): Embed {
    return new Embed(async (embed, reply, mention) => {
      if (reply) return await this.reply(embed, mention)
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

    return PermissionsUtils.has(PermissionsUtils.combine({
      guild: this.guild,
      member: this.member,
      overwrites: this.channel?.permission_overwrites,
      roleList: this.worker.guildRoles.get(this.guild.id)
    }), perms)
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
