import { APIEmbed, APIMessage } from 'discord-api-types';
/**
 * Discord Embed
 */
export declare class Embed<Res extends APIMessage | null = APIMessage> {
    private readonly sendback?;
    obj: APIEmbed;
    constructor(sendback?: ((embed: Embed<Res>, reply: boolean, mention: boolean, ephermal: boolean) => Promise<Res>) | undefined);
    /**
     * Sets the color
     * @param color Color hex code
     */
    color(color: number): this;
    /**
     * Sets author
     * @param name Name of author
     * @param icon Author avatar icon
     * @param url URL anchored to the author name
     */
    author(name?: string, icon?: string, url?: string): this;
    /**
     * Sets the title
     * @param title Title name
     * @param url URL anchored to title name
     */
    title(title?: string, url?: string): this;
    /**
     * Sets description
     * @param desc Description
     */
    description(desc: string): this;
    /**
     * Adds a field
     * @param name Fields title
     * @param value Fields value
     * @param inline Whether the field is inline
     */
    field(name: string, value: string, inline?: boolean): this;
    /**
     * Sets the thumbnail
     * @param url URL of thumbnail
     * @param width Optional fixed width
     * @param height Optional fixed height
     */
    thumbnail(url: string, width?: number, height?: number): this;
    /**
     * Sets the image
     * @param url URL of image
     * @param width Optional fixed width
     * @param height Optional fixed height
     */
    image(url: string, width?: number, height?: number): this;
    /**
     * Sets the footer
     * @param text Text for footer
     * @param icon Small icon on the bottom left
     */
    footer(text?: string, icon?: string): this;
    /**
     * Sets the timestamp
     * @param date Date to set, leave blank for current time
     */
    timestamp(date?: Date): this;
    /**
     * Sends embed to channel
     * @param reply Whether or not to do so in an inline reply (defaults to true)
     * @param mention Whether or not to mention the user in the reply (defaults to false)
     */
    send(reply?: boolean, mention?: boolean, ephermal?: boolean): Promise<Res>;
    /**
     * Renders the embed
     * @returns
     */
    render(): APIEmbed;
}
