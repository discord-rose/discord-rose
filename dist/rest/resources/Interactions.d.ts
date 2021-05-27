/// <reference types="node" />
import { RESTGetAPIApplicationCommandsResult, RESTGetAPIApplicationGuildCommandsResult, RESTPatchAPIApplicationCommandJSONBody, RESTPatchAPIApplicationCommandResult, RESTPatchAPIApplicationGuildCommandJSONBody, RESTPatchAPIApplicationGuildCommandResult, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, RESTPostAPIApplicationGuildCommandsJSONBody, RESTPostAPIApplicationGuildCommandsResult, RESTPostAPIInteractionCallbackJSONBody, RESTPutAPIApplicationCommandsJSONBody, RESTPutAPIApplicationCommandsResult, RESTPutAPIApplicationGuildCommandsJSONBody, RESTPutAPIApplicationGuildCommandsResult, Snowflake } from 'discord-api-types';
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
    set(data: RESTPutAPIApplicationCommandsJSONBody | RESTPutAPIApplicationGuildCommandsJSONBody, applicationId: Snowflake, guildId?: Snowflake): Promise<RESTPutAPIApplicationCommandsResult | RESTPutAPIApplicationGuildCommandsResult>;
    /**
     * Gets all posted commands for an application
     * @param applicationId Application/client ID
     * @param guildId Optional guild ID to only get commands from a specific guild
     */
    get(applicationId: Snowflake, guildId?: Snowflake): Promise<RESTGetAPIApplicationCommandsResult | RESTGetAPIApplicationGuildCommandsResult>;
    /**
     * Adds a command for an application
     * @param data Interaction data
     * @param applicationId Application/client ID
     * @param guildId Optional guild ID to only add a command for a specific guild
     */
    add(data: RESTPostAPIApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody, applicationId: Snowflake, guildId?: Snowflake): Promise<RESTPostAPIApplicationCommandsResult | RESTPostAPIApplicationGuildCommandsResult>;
    /**
     * Deletes a specific command for an application
     * @param interactionId Interaction ID
     * @param applicationId Application/client ID
     * @param guildId Optional guild ID to only delete a command for a specific guild
     */
    delete(interactionId: Snowflake, applicationId: Snowflake, guildId?: Snowflake): Promise<void>;
    /**
     * Updates/upserts a specific command
     * @param data Interaction data
     * @param applicationId Application/client ID
     * @param interactionId Interaction ID
     * @param guildId Optional guild ID to only update a command for a specific guild
     */
    update(data: RESTPatchAPIApplicationCommandJSONBody | RESTPatchAPIApplicationGuildCommandJSONBody, applicationId: Snowflake, interactionId: Snowflake, guildId?: Snowflake): Promise<RESTPatchAPIApplicationCommandResult | RESTPatchAPIApplicationGuildCommandResult>;
    /**
     * Responds to an interaction
     * @param interactionId Interaction ID
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
