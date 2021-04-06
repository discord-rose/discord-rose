import { APIGuildMember, APIMessage, APIChannel, APIRole, Snowflake } from 'discord-api-types'

import { Embed } from './Embed'
import { MessageTypes, MessagesResource } from '../rest/resources/Messages'

import { CommandOptions, Worker } from '../typings/lib'

import { PermissionsUtils, bits } from '../utils/Permissions'
import Collection from '@discordjs/collection'
import { CachedGuild } from '../typings/Discord'
import { CommandError } from './CommandHandler'

/**
 * Context holding all information about a ran command and utility functions
 */
export class CommandContext {
  public args: string[] = []

  constructor (public worker: Worker, public message: APIMessage, public command: CommandOptions, public prefix: string, public ran: string) {}

  /**
   * Guild where the message was sent
   * @type {CachedGuild}
   */
  get guild (): CachedGuild | undefined {
    return this.worker.guilds.get(this.message.guild_id as Snowflake)
  }

  /**
   * Channel where the message was sent
   * @type {APIChannel}
   */
  get channel (): APIChannel | undefined {
    return this.worker.channels.get(this.message.channel_id)
  }

  /**
   * Member who sent the message
   * @type {APIGuildMember}
   */
  get member (): APIGuildMember {
    const mem = Object.assign({ user: this.message.author }, this.message.member)

    return mem
  }

  /**
   * Bot's memeber within the guild
   * @type {APIGuildMember}
   */
  get me (): APIGuildMember {
    return this.worker.selfMember.get(this.message.guild_id as Snowflake) as APIGuildMember
  }

  /**
   * Replies to the invoking message
   * @param {MessageTypes} data Data for message
   * @param {boolean} mention Whether or not to mention the user in the reply (defaults to false)
   * @returns {Promise<APIMessage>} Message sent
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
   * @param {MessageTypes} data Data for message
   * @returns {Promise<APIMessage>} Message sent
   */
  async send (data: MessageTypes): Promise<APIMessage> {
    return await this.worker.api.messages.send(this.message.channel_id, data)
  }

  /**
   * Runs an error through sendback of commands.error
   * @param {string} message Message of error
   */
  error (message: string): void {
    const error = new CommandError(message)

    error.nonFatal = true

    this.worker.commands.errorFunction(this, error)
  }

  /**
   * Sends a message to the user who ran the command
   * @param {MessageTypes} data Data for message
   */
  async dm (data: MessageTypes): Promise<APIMessage> {
    return await this.worker.api.users.dm(this.message.author.id, data)
  }

  /**
   * Sends a file to the same channel
   * @param {Buffer} file File buffer
   * @param {MessageTypes} extra Extra message options
   * @returns {Promise<APIMessage>}
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
   * @type {Embed}
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
   * @param {PermissionName} perms Permission to test
   * @returns {boolean}
   */
  hasPerms (perms: keyof typeof bits): boolean {
    if (!this.guild) throw new Error()
    return PermissionsUtils.calculate(this.member, this.guild, this.worker.guildRoles.get(this.guild.id) as Collection<any, APIRole>, perms)
  }

  /**
   * Whether or not the bot user has a certain permission
   * @param {PermissionName} perms Permission to test
   * @returns {boolean}
   */
  myPerms (perms: keyof typeof bits): boolean {
    if (!this.guild) throw new Error()
    return PermissionsUtils.calculate(this.me, this.guild, this.worker.guildRoles.get(this.guild.id) as Collection<any, APIRole>, perms)
  }
}
