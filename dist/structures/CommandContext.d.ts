/// <reference types="node" />
import { APIGuildMember, APIMessage, APIChannel } from 'discord-api-types';
import { Embed } from './Embed';
import { MessageTypes } from '../rest/resources/Messages';
import { CommandOptions, Worker } from '../typings/lib';
import { bits } from '../utils/Permissions';
import { CachedGuild } from '../typings/Discord';
/**
 * Context holding all information about a ran command and utility functions
 */
export declare class CommandContext {
    worker: Worker;
    message: APIMessage;
    command: CommandOptions;
    prefix: string;
    ran: string;
    args: string[];
    constructor(worker: Worker, message: APIMessage, command: CommandOptions, prefix: string, ran: string);
    /**
     * Guild where the message was sent
     * @type {CachedGuild}
     */
    get guild(): CachedGuild | undefined;
    /**
     * Channel where the message was sent
     * @type {APIChannel}
     */
    get channel(): APIChannel | undefined;
    /**
     * Member who sent the message
     * @type {APIGuildMember}
     */
    get member(): APIGuildMember;
    /**
     * Bot's memeber within the guild
     * @type {APIGuildMember}
     */
    get me(): APIGuildMember;
    /**
     * Replies to the invoking message
     * @param {MessageTypes} data Data for message
     * @param {boolean} mention Whether or not to mention the user in the reply (defaults to false)
     * @returns {Promise<APIMessage>} Message sent
     */
    reply(data: MessageTypes, mention?: boolean): Promise<APIMessage>;
    /**
     * Sends a message in the same channel as invoking message
     * @param {MessageTypes} data Data for message
     * @returns {Promise<APIMessage>} Message sent
     */
    send(data: MessageTypes): Promise<APIMessage>;
    /**
     * Runs an error through sendback of commands.error
     * @param {string} message Message of error
     */
    error(message: string): void;
    /**
     * Sends a message to the user who ran the command
     * @param {MessageTypes} data Data for message
     */
    dm(data: MessageTypes): Promise<APIMessage>;
    /**
     * Sends a file to the same channel
     * @param {Buffer} file File buffer
     * @param {MessageTypes} extra Extra message options
     * @returns {Promise<APIMessage>}
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
     * @type {Embed}
     * @example
     * ctx.embed
     *   .title('Hello')
     *   .send()
     */
    get embed(): Embed;
    /**
     * Whether or not the running user has a certain permission
     * @param {PermissionName} perms Permission to test
     * @returns {boolean}
     */
    hasPerms(perms: keyof typeof bits): boolean;
    /**
     * Whether or not the bot user has a certain permission
     * @param {PermissionName} perms Permission to test
     * @returns {boolean}
     */
    myPerms(perms: keyof typeof bits): boolean;
}
