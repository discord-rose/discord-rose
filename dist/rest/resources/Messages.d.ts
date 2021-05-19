/// <reference types="node" />
import { APIInteractionApplicationCommandCallbackData, APIMessageReferenceSend, RESTGetAPIChannelMessageReactionUsersQuery, RESTGetAPIChannelMessageReactionUsersResult, RESTGetAPIChannelMessageResult, RESTPatchAPIChannelMessageResult, RESTPostAPIChannelMessageCrosspostResult, RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelMessageResult, RESTPostAPIWebhookWithTokenJSONBody, RESTPutAPIChannelMessageReactionResult, Snowflake } from 'discord-api-types';
import { Embed } from '../../structures/Embed';
import { RestManager } from '../Manager';
/**
 * ID of custom emoji or unicode emoji
 */
export declare type Emoji = string | Snowflake;
declare type StringifiedMessageTypes = string | Function | bigint | number | symbol | undefined;
export declare type MessageTypes = RESTPostAPIChannelMessageJSONBody | RESTPostAPIWebhookWithTokenJSONBody | StringifiedMessageTypes | Embed<any>;
/**
 * Message resource
 */
export declare class MessagesResource {
    private readonly rest;
    constructor(rest: RestManager);
    static _formMessage(message: MessageTypes, webhook?: boolean): RESTPostAPIWebhookWithTokenJSONBody | RESTPostAPIChannelMessageJSONBody | APIInteractionApplicationCommandCallbackData;
    /**
     * Sends a message to a channel
     * @param channelId ID of channel
     * @param data Message data
     */
    send(channelId: Snowflake, data: MessageTypes, reply?: APIMessageReferenceSend): Promise<RESTPostAPIChannelMessageResult>;
    /**
     * Sends a file to a channel
     * @param channelId ID of channel
     * @param data File Buffer and name
     * @param extra Extra message data
     */
    sendFile(channelId: Snowflake, data: {
        name: string;
        buffer: Buffer;
    }, extra?: MessageTypes): Promise<RESTPostAPIChannelMessageResult>;
    /**
     * Gets a message
     * @param channelId ID of channel
     * @param messageId ID of message
     */
    get(channelId: Snowflake, messageId: Snowflake): Promise<RESTGetAPIChannelMessageResult>;
    /**
     * Deletes a message
     * @param channelId ID of channel
     * @param messageId ID of message
     */
    delete(channelId: Snowflake, messageId: Snowflake): Promise<never>;
    /**
     * Deletes multiple messages
     * @param channelId ID of channel
     * @param messageIds ID of messages
     */
    bulkDelete(channelId: Snowflake, messageIds: Snowflake[]): Promise<never>;
    /**
     * Edits a message
     * @param channelId ID of channel
     * @param messageId ID of message
     * @param data New message data
     */
    edit(channelId: Snowflake, messageId: Snowflake, data: MessageTypes): Promise<RESTPatchAPIChannelMessageResult>;
    /**
     * Publishes a message in a news channel
     * @param channelId ID of channel
     * @param messageId ID of message
     */
    crosspost(channelId: Snowflake, messageId: Snowflake): Promise<RESTPostAPIChannelMessageCrosspostResult>;
    private _parseEmoji;
    /**
     * Gets users who've reacted with a specific emoji
     * @param channelId ID of channel
     * @param messageId ID of message
     * @param emoji ID or unicode for emoji
     * @param query Query for fetching
     */
    getReactions(channelId: Snowflake, messageId: Snowflake, emoji: Emoji, query?: RESTGetAPIChannelMessageReactionUsersQuery): Promise<RESTGetAPIChannelMessageReactionUsersResult>;
    /**
     * Adds a reaction to a message
     * @param channelId ID of channel
     * @param messageId ID of message
     * @param emoji ID or unicode for emoji
     */
    react(channelId: Snowflake, messageId: Snowflake, emoji: Emoji): Promise<RESTPutAPIChannelMessageReactionResult>;
    /**
     * Removes one reaction for a specific user
     * @param channelId ID of channel
     * @param messageId ID of message
     * @param emoji ID or unicode for emoji
     * @param user Users or leave blank to remove your own
     */
    deleteReaction(channelId: Snowflake, messageId: Snowflake, emoji: Emoji, user?: Snowflake | '@me'): Promise<never>;
    /**
     * Deletes multiple reactions from a message
     * @param channelId ID of channel
     * @param messageId ID of message
     * @param emoji Emoji ID or unicode, or leave blank to remove all reactions
     */
    deleteAllReactions(channelId: Snowflake, messageId: Snowflake, emoji?: Emoji): Promise<never>;
}
export {};
