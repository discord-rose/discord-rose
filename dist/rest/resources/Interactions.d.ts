/// <reference types="node" />
import { RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIInteractionCallbackJSONBody, RESTPutAPIApplicationCommandsJSONBody, Snowflake } from 'discord-api-types';
import { RestManager } from '../Manager';
import { MessageTypes } from './Messages';
/**
 * Interactions resource
 */
export declare class InteractionResource {
    private readonly rest;
    constructor(rest: RestManager);
    /**
     * Sets all commands for an application, clearing previous
     * @param data An array of interaction data
     * @param applicationId Application/client ID
     * @param guildId Optional guild ID to only set commands for specific guild
     */
    set(data: RESTPutAPIApplicationCommandsJSONBody, applicationId: Snowflake, guildId?: Snowflake): Promise<RESTPostAPIApplicationCommandsResult>;
    /**
     * Updates/upserts a specific command
     * @param data Interaction data
     * @param applicationId Application/client ID
     * @param commandId Command ID to replace
     * @param guildId Optional guild ID to only set command to specific guild
     */
    update(data: RESTPostAPIApplicationCommandsJSONBody, applicationId: Snowflake, commandId?: string, guildId?: Snowflake): Promise<RESTPostAPIApplicationCommandsResult>;
    /**
     * Responds to an interaction
     * @param interactionId Interact ID
     * @param interactionToken Interaction Token
     * @param data Interaction Callback Data
     */
    callback(interactionId: Snowflake, interactionToken: string, data: RESTPostAPIInteractionCallbackJSONBody): Promise<null>;
    /**
     * Sends a file to a channel
     * @param channelId ID of channel
     * @param data File Buffer and name
     * @param extra Extra message data
     */
    callbackFile(interactionId: Snowflake, interactionToken: string, data: {
        name: string;
        buffer: Buffer;
    }, extra?: MessageTypes): Promise<null>;
}
