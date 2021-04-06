"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandContext = void 0;
const Embed_1 = require("./Embed");
const Messages_1 = require("../rest/resources/Messages");
const Permissions_1 = require("../utils/Permissions");
const CommandHandler_1 = require("./CommandHandler");
/**
 * Context holding all information about a ran command and utility functions
 */
class CommandContext {
    /**
     * Command Context
     * @param worker Worker
     * @param message Message object
     * @param command Command object
     * @param prefix Prefix that the command was ran via
     * @param ran The actual ran command including aliases
     */
    constructor(worker, message, command, prefix, ran) {
        this.worker = worker;
        this.message = message;
        this.command = command;
        this.prefix = prefix;
        this.ran = ran;
        this.args = [];
    }
    /**
     * Guild where the message was sent
     * @type {CachedGuild}
     */
    get guild() {
        return this.worker.guilds.get(this.message.guild_id);
    }
    /**
     * Channel where the message was sent
     * @type {APIChannel}
     */
    get channel() {
        return this.worker.channels.get(this.message.channel_id);
    }
    /**
     * Member who sent the message
     * @type {APIGuildMember}
     */
    get member() {
        const mem = Object.assign({ user: this.message.author }, this.message.member);
        return mem;
    }
    /**
     * Bot's memeber within the guild
     * @type {APIGuildMember}
     */
    get me() {
        return this.worker.selfMember.get(this.message.guild_id);
    }
    /**
     * Replies to the invoking message
     * @param data Data for message
     * @param mention Whether or not to mention the user in the reply (defaults to false)
     * @returns Message sent
     */
    async reply(data, mention = false) {
        if (!mention) {
            data = Messages_1.MessagesResource._formMessage(data);
            if (!data.allowed_mentions)
                data.allowed_mentions = {};
            data.allowed_mentions.replied_user = false;
        }
        return await this.worker.api.messages.send(this.message.channel_id, data, {
            message_id: this.message.id,
            channel_id: this.message.channel_id,
            guild_id: this.message.guild_id
        });
    }
    /**
     * Sends a message in the same channel as invoking message
     * @param data Data for message
     * @returns Message sent
     */
    async send(data) {
        return await this.worker.api.messages.send(this.message.channel_id, data);
    }
    /**
     * Runs an error through sendback of commands.error
     * @param message Message of error
     */
    error(message) {
        const error = new CommandHandler_1.CommandError(message);
        error.nonFatal = true;
        this.worker.commands.errorFunction(this, error);
    }
    /**
     * Sends a message to the user who ran the command
     * @param data Data for message
     */
    async dm(data) {
        return await this.worker.api.users.dm(this.message.author.id, data);
    }
    /**
     * Sends a file to the same channel
     * @param file File buffer
     * @param extra Extra message options
     * @returns
     */
    async sendFile(file, extra) {
        return await this.worker.api.messages.sendFile(this.message.channel_id, file, extra);
    }
    /**
     * Starts typing in the channel
     */
    async typing() {
        return await this.worker.api.channels.typing(this.message.channel_id);
    }
    /**
     * Deletes the invoking message
     */
    async delete() {
        return await this.worker.api.messages.delete(this.message.channel_id, this.message.id);
    }
    /**
     * Makes an embed to send
     * @type {Embed}
     * @example
     * ctx.embed
     *   .title('Hello')
     *   .send()
     */
    get embed() {
        return new Embed_1.Embed(async (embed, reply, mention) => {
            if (reply)
                return await this.reply(embed, mention);
            else
                return await this.send(embed);
        });
    }
    /**
     * Whether or not the running user has a certain permission
     * @param perms Permission to test
     * @returns
     */
    hasPerms(perms) {
        if (!this.guild)
            throw new Error();
        return Permissions_1.PermissionsUtils.calculate(this.member, this.guild, this.worker.guildRoles.get(this.guild.id), perms);
    }
    /**
     * Whether or not the bot user has a certain permission
     * @param perms Permission to test
     * @returns
     */
    myPerms(perms) {
        if (!this.guild)
            throw new Error();
        return Permissions_1.PermissionsUtils.calculate(this.me, this.guild, this.worker.guildRoles.get(this.guild.id), perms);
    }
}
exports.CommandContext = CommandContext;
