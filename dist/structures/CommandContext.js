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
    constructor(opts) {
        this.worker = opts.worker;
        this.message = opts.message;
        this.command = opts.command;
        this.prefix = opts.prefix;
        this.ran = opts.ran;
        this.args = opts.args;
    }
    /**
     * Author of the message
     */
    get author() {
        return this.message.author;
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
     * React to the invoking command message
     * @param emoji ID of custom emoji or unicode emoji
     */
    async react(emoji) {
        return await this.worker.api.messages.react(this.message.channel_id, this.message.id, emoji);
    }
    /**
     * Runs an error through sendback of commands.error
     * @param message Message of error
     */
    async error(message) {
        const error = new CommandHandler_1.CommandError(await message);
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
        var _a;
        if (!this.guild)
            throw new Error('Missing guild');
        return Permissions_1.PermissionsUtils.has(Permissions_1.PermissionsUtils.combine({
            guild: this.guild,
            member: this.member,
            overwrites: (_a = this.channel) === null || _a === void 0 ? void 0 : _a.permission_overwrites,
            roleList: this.worker.guildRoles.get(this.guild.id)
        }), perms);
    }
    /**
     * Whether or not the bot user has a certain permission
     * @param perms Permission to test
     * @returns
     */
    myPerms(perms) {
        var _a;
        if (!this.guild)
            throw new Error();
        return Permissions_1.PermissionsUtils.has(Permissions_1.PermissionsUtils.combine({
            guild: this.guild,
            member: this.me,
            overwrites: (_a = this.channel) === null || _a === void 0 ? void 0 : _a.permission_overwrites,
            roleList: this.worker.guildRoles.get(this.guild.id)
        }), perms);
    }
}
exports.CommandContext = CommandContext;
