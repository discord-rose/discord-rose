import { APIEmbed, APIMessage } from 'discord-api-types';
/**
 * Discord Embed
 */
export declare class Embed {
    private readonly sendback?;
    obj: APIEmbed;
    constructor(sendback?: ((embed: Embed, reply: boolean, mention: boolean) => Promise<APIMessage>) | undefined);
    /**
     * Sets the color
     * @param {number} color Color hex code
     */
    color(color: number): this;
    /**
     * Sets author
     * @param {string} name Name of author
     * @param {string} icon Author avatar icon
     * @param {string} url URL anchored to the author name
     */
    author(name?: string, icon?: string, url?: string): this;
    /**
     * Sets the title
     * @param {string} title Title name
     * @param {string} url URL anchored to title name
     */
    title(title?: string, url?: string): this;
    /**
     * Sets description
     * @param {string} desc Description
     */
    description(desc: string): this;
    /**
     * Adds a field
     * @param {string} name Fields title
     * @param {string} value Fields value
     * @param {boolean} inline Whether the field is inline
     */
    field(name: string, value: string, inline?: boolean): this;
    /**
     * Sets the thumbnail
     * @param {string} url URL of thumbnail
     * @param {number} width Optional fixed width
     * @param {number} height Optional fixed height
     */
    thumbnail(url: string, width?: number, height?: number): this;
    /**
     * Sets the image
     * @param {string} url URL of image
     * @param {number} width Optional fixed width
     * @param {number} height Optional fixed height
     */
    image(url: string, width?: number, height?: number): this;
    /**
     * Sets the footer
     * @param {string} text Text for footer
     * @param {string} icon Small icon on the bottom left
     */
    footer(text?: string, icon?: string): this;
    /**
     * Sets the timestamp
     * @param {Date} date Date to set, leave blank for current time
     */
    timestamp(date?: Date): this;
    /**
     * Sends embed to channel
     * @param {boolean} reply Whether or not to do so in an inline reply (defaults to true)
     * @param {boolean} mention Whether or not to mention the user in the reply (defaults to false)
     */
    send(reply?: boolean, mention?: boolean): Promise<APIMessage>;
    /**
     * Renders the embed
     * @returns {APIEmbed}
     */
    render(): APIEmbed;
}
