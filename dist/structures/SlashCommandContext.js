"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommandContext = void 0;
const Embed_1 = require("./Embed");
const Messages_1 = require("../rest/resources/Messages");
const Permissions_1 = require("../utils/Permissions");
const CommandHandler_1 = require("./CommandHandler");
class SlashCommandContext {
    constructor(opts) {
        /**
         * Whether or not a command is an interaction or not
         */
        this.isInteraction = true;
        this.sent = false;
        this.worker = opts.worker;
        this.interaction = opts.interaction;
        this.command = opts.command;
        this.prefix = opts.prefix;
        this.ran = opts.ran;
        this.args = opts.args;
    }
    async react() {
        throw new Error('Cannot access ctx.react() since the command was ran as a slash command');
    }
    async delete() {
        throw new Error('Cannot access ctx.delete() since the command was ran as a slash command');
    }
    get message() {
        throw new Error('Cannot access ctx.message since the command was ran as a slash command');
    }
    /**
     * Author of the message
     */
    get author() {
        return this.interaction.member.user;
    }
    /**
     * Guild where the message was sent
     */
    get guild() {
        return this.worker.guilds.get(this.interaction.guild_id);
    }
    /**
     * Channel where the message was sent
     */
    get channel() {
        return this.worker.channels.get(this.interaction.channel_id);
    }
    /**
     * Member who sent the message
     */
    get member() {
        return this.interaction.member;
    }
    /**
     * Bot's memeber within the guild
     */
    get me() {
        return this.worker.selfMember.get(this.interaction.guild_id);
    }
    /**
     * Replies to the invoking message
     * @param data Data for message
     * @returns nothing
     */
    async reply(data, mention = false, ephermal = false) {
        return await this.send(data, ephermal);
    }
    async _callback(data) {
        this.sent = true;
        return await this.worker.api.interactions.callback(this.interaction.id, this.interaction.token, data);
    }
    /**
     * Sends a message in the same channel as invoking message
     * @param data Data for message
     * @returns Message sent
     */
    async send(data, ephermal = false) {
        const message = Messages_1.MessagesResource._formMessage(data, true);
        if (ephermal) {
            message.flags = 64 /* EPHEMERAL */;
        }
        if (this.sent) {
            await this.worker.api.webhooks.editMessage(this.worker.user.id, this.interaction.token, '@original', message);
            return null;
        }
        return await this._callback({
            type: 4 /* ChannelMessageWithSource */,
            data: message
        });
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
        return await this.worker.api.users.dm(this.author.id, data);
    }
    /**
     * Sends a file to the same channel
     * @param file File buffer
     * @param extra Extra message options
     * @returns
     */
    async sendFile(file, extra) {
        return await this.worker.api.interactions.callbackFile(this.interaction.id, this.interaction.token, file, extra);
    }
    /**
     * Starts typing in the channel
     */
    async typing() {
        return await this._callback({
            type: 5 /* DeferredChannelMessageWithSource */
        });
    }
    /**
     * Makes an embed to send
     * @example
     * ctx.embed
     *   .title('Hello')
     *   .send()
     */
    get embed() {
        return new Embed_1.Embed(async (embed, reply, mention, ephermal) => {
            if (reply)
                return await this.reply(embed, mention, ephermal);
            else
                return await this.send(embed, ephermal);
        });
    }
    /**
     * Whether or not the running user has a certain permission
     * @param perms Permission to test
     * @returns
     */
    hasPerms(perms) {
        return Permissions_1.PermissionsUtils.has(Number(this.member.permissions), perms);
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
exports.SlashCommandContext = SlashCommandContext;
