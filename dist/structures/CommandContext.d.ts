/// <reference types="node" />
import { APIGuildMember, APIMessage, APIChannel, APIUser } from 'discord-api-types';
import { Embed } from './Embed';
import { MessageTypes, Emoji } from '../rest/resources/Messages';
import { CommandOptions, Worker } from '../typings/lib';
import { bits } from '../utils/Permissions';
import { CachedGuild } from '../typings/Discord';
import { Interaction } from './SlashCommandContext';
/**
 * Context holding all information about a ran command and utility functions
 */
export declare class CommandContext {
    /**
     * Whether or not a command is an interaction or not
     */
    isInteraction: boolean;
    get interaction(): Interaction;
    /**
     * Command arguments
     */
    args: any[];
    /**
     * Worker
     */
    worker: Worker;
    /**
     * Message which command was ran with
     */
    message: APIMessage;
    /**
     * Command options object
     */
    command: CommandOptions;
    /**
     * Prefix command was ran with
     */
    prefix: string;
    /**
     * Actual command that was ran (including possible aliases)
     */
    ran: string;
    constructor(opts: {
        worker: Worker;
        message: APIMessage;
        command: CommandOptions;
        prefix: string;
        ran: string;
        args: string[];
    });
    /**
     * Author of the message
     */
    get author(): APIUser;
    /**
     * Guild where the message was sent
     */
    get guild(): CachedGuild | undefined;
    /**
     * Channel where the message was sent
     */
    get channel(): APIChannel | undefined;
    /**
     * Member who sent the message
     */
    get member(): APIGuildMember;
    /**
     * Bot's memeber within the guild
     */
    get me(): APIGuildMember;
    /**
     * Replies to the invoking message
     * @param data Data for message
     * @param mention Whether or not to mention the user in the reply (defaults to false)
     * @returns Message sent
     */
    reply(data: MessageTypes, mention?: boolean): Promise<APIMessage>;
    /**
     * Sends a message in the same channel as invoking message
     * @param data Data for message
     * @returns Message sent
     */
    send(data: MessageTypes): Promise<APIMessage>;
    /**
     * React to the invoking command message
     * @param emoji ID of custom emoji or unicode emoji
     */
    react(emoji: Emoji): Promise<never>;
    /**
     * Runs an error through sendback of commands.error
     * @param message Message of error
     */
    error(message: string | Promise<string>): Promise<void>;
    /**
     * Sends a message to the user who ran the command
     * @param data Data for message
     */
    dm(data: MessageTypes): Promise<APIMessage>;
    /**
     * Sends a file to the same channel
     * @param file File buffer
     * @param extra Extra message options
     * @returns
     */
    sendFile(file: {
        name: string;
        buffer: Buffer;
    }, extra?: MessageTypes): Promise<APIMessage>;
    /**
     * Starts typing in the channel
     */
    typing(): Promise<never>;
    /**
     * Deletes the invoking message
     */
    delete(): Promise<never>;
    /**
     * Makes an embed to send
     * @example
     * ctx.embed
     *   .title('Hello')
     *   .send()
     */
    get embed(): Embed;
    /**
     * Whether or not the running user has a certain permission
     * @param perms Permission to test
     * @returns
     */
    hasPerms(perms: keyof typeof bits): boolean;
    /**
     * Whether or not the bot user has a certain permission
     * @param perms Permission to test
     * @returns
     */
    myPerms(perms: keyof typeof bits): boolean;
}
