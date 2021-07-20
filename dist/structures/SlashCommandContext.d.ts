/// <reference types="node" />
import { CommandContext } from './CommandContext';
import { APIGuildMember, APIMessage, APIChannel, APIUser, APIApplicationCommandInteractionDataOptionWithValues, APIGuildInteraction, APIApplicationCommandInteractionData, APIApplicationCommandInteraction } from 'discord-api-types';
import { Embed } from './Embed';
import { MessageTypes } from '../rest/resources/Messages';
import { CommandOptions, Worker } from '../typings/lib';
import { bits } from '../utils/Permissions';
import { CachedGuild } from '../typings/Discord';
export interface InteractionData extends APIApplicationCommandInteractionData {
    options: APIApplicationCommandInteractionDataOptionWithValues[];
}
export interface Interaction extends APIApplicationCommandInteraction {
    data: InteractionData;
}
/**
 * Interaction sub-object
 */
export interface InteractionOptions {
    [key: string]: InteractionOptions | undefined | any;
}
export declare class SlashCommandContext implements Omit<CommandContext, 'reply' | 'send' | 'sendFile' | 'embed' | 'args'> {
    /**
     * Whether or not a command is an interaction or not
     */
    isInteraction: boolean;
    react(): Promise<never>;
    delete(): Promise<never>;
    get message(): APIMessage;
    /**
     * Command arguments
     */
    args: Array<InteractionData['options'][number]['value']>;
    /**
     * Worker
     */
    worker: Worker;
    /**
     * Message which command was ran with
     */
    interaction: Interaction;
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
    /**
     * Interaction options if ran as a slash command
     */
    options: InteractionOptions;
    constructor(opts: {
        worker: Worker;
        interaction: Interaction;
        command: CommandOptions;
        prefix: string;
        ran: string;
        args: SlashCommandContext['args'];
    });
    private sent;
    /**
     * Author of the message
     */
    get author(): APIUser;
    /**
     * Guild where the message was sent
     */
    get guild(): CachedGuild;
    /**
     * Channel where the message was sent
     */
    get channel(): APIChannel | undefined;
    /**
     * Member who sent the message
     */
    get member(): APIGuildInteraction['member'];
    /**
     * Bot's memeber within the guild
     */
    get me(): APIGuildMember;
    /**
     * Replies to the invoking message
     * @param data Data for message
     * @returns nothing
     */
    reply(data: MessageTypes, mention?: boolean, ephermal?: boolean): Promise<null>;
    private _callback;
    /**
     * Sends a message in the same channel as invoking message
     * @param data Data for message
     * @returns Message sent
     */
    send(data: MessageTypes, ephermal?: boolean): Promise<null>;
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
    }, extra?: MessageTypes): Promise<null>;
    /**
     * Starts typing in the channel
     */
    typing(): Promise<null>;
    /**
     * Makes an embed to send
     * @example
     * ctx.embed
     *   .title('Hello')
     *   .send()
     */
    get embed(): Embed<null>;
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
