import Collection from '@discordjs/collection';
import { APIGuildMember, APIOverwrite, Snowflake } from 'discord-api-types';
import { CachedGuild, DiscordEventMap } from '../typings/Discord';
export declare const bits: {
    createInvites: number;
    kick: number;
    ban: number;
    administrator: number;
    manageChannels: number;
    manageGuild: number;
    addReactions: number;
    auditLog: number;
    prioritySpeaker: number;
    stream: number;
    viewChannel: number;
    sendMessages: number;
    tts: number;
    manageMessages: number;
    embed: number;
    files: number;
    readHistory: number;
    mentionEveryone: number;
    externalEmojis: number;
    viewInsights: number;
    connect: number;
    speak: number;
    mute: number;
    deafen: number;
    move: number;
    useVoiceActivity: number;
    nickname: number;
    manageNicknames: number;
    manageRoles: number;
    webhooks: number;
    emojis: number;
};
export declare const PermissionsUtils: {
    bits: {
        createInvites: number;
        kick: number;
        ban: number;
        administrator: number;
        manageChannels: number;
        manageGuild: number;
        addReactions: number;
        auditLog: number;
        prioritySpeaker: number;
        stream: number;
        viewChannel: number;
        sendMessages: number;
        tts: number;
        manageMessages: number;
        embed: number;
        files: number;
        readHistory: number;
        mentionEveryone: number;
        externalEmojis: number;
        viewInsights: number;
        connect: number;
        speak: number;
        mute: number;
        deafen: number;
        move: number;
        useVoiceActivity: number;
        nickname: number;
        manageNicknames: number;
        manageRoles: number;
        webhooks: number;
        emojis: number;
    };
    /**
     * Test a permission on a user
     * @param bit Combined permission
     * @param perm Permission name to test
     * @returns Whether or not the user has permissions
     */
    has(bit: number, perm: keyof typeof bits): boolean;
    /**
     * @deprecated
     */
    calculate(member: APIGuildMember, guild: CachedGuild, roleList: Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>, required: keyof typeof bits): boolean;
    /**
     * Adds multiple permission sources together
     * @param data Data filled with possible permission data
     * @returns Full permission bit
     */
    combine(data: {
        member: APIGuildMember;
        guild: CachedGuild;
        roleList?: Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>;
        overwrites?: APIOverwrite[];
    }): number;
    /**
     * Test two bits together
     * @param perms Combined permissions
     * @param bit Number bit ermission to test
     * @returns Whether or not the user has permissions
     */
    hasPerms(perms: number, bit: number): boolean;
};
