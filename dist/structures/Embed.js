"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Embed = void 0;
/**
 * Discord Embed
 */
class Embed {
    constructor(sendback) {
        this.sendback = sendback;
        this.obj = {};
    }
    /**
     * Sets the color
     * @param {number} color Color hex code
     */
    color(color) {
        this.obj.color = color;
        return this;
    }
    /**
     * Sets author
     * @param {string} name Name of author
     * @param {string} icon Author avatar icon
     * @param {string} url URL anchored to the author name
     */
    author(name, icon, url) {
        this.obj.author = {
            name,
            icon_url: icon,
            url
        };
        return this;
    }
    /**
     * Sets the title
     * @param {string} title Title name
     * @param {string} url URL anchored to title name
     */
    title(title, url) {
        if (title)
            this.obj.title = title;
        if (url)
            this.obj.url = url;
        return this;
    }
    /**
     * Sets description
     * @param {string} desc Description
     */
    description(desc) {
        this.obj.description = desc;
        return this;
    }
    /**
     * Adds a field
     * @param {string} name Fields title
     * @param {string} value Fields value
     * @param {boolean} inline Whether the field is inline
     */
    field(name, value, inline) {
        if (!this.obj.fields)
            this.obj.fields = [];
        this.obj.fields.push({
            name,
            value,
            inline
        });
        return this;
    }
    /**
     * Sets the thumbnail
     * @param {string} url URL of thumbnail
     * @param {number} width Optional fixed width
     * @param {number} height Optional fixed height
     */
    thumbnail(url, width, height) {
        this.obj.thumbnail = {
            url,
            width,
            height
        };
        return this;
    }
    /**
     * Sets the image
     * @param {string} url URL of image
     * @param {number} width Optional fixed width
     * @param {number} height Optional fixed height
     */
    image(url, width, height) {
        this.obj.image = {
            url,
            width,
            height
        };
        return this;
    }
    /**
     * Sets the footer
     * @param {string} text Text for footer
     * @param {string} icon Small icon on the bottom left
     */
    footer(text, icon) {
        if (!this.obj.footer)
            this.obj.footer = { text: '' };
        if (text)
            this.obj.footer.text = text;
        if (icon)
            this.obj.footer.icon_url = icon;
        return this;
    }
    /**
     * Sets the timestamp
     * @param {Date} date Date to set, leave blank for current time
     */
    timestamp(date = new Date()) {
        this.obj.timestamp = date.toISOString();
        return this;
    }
    /**
     * Sends embed to channel
     * @param {boolean} reply Whether or not to do so in an inline reply (defaults to true)
     * @param {boolean} mention Whether or not to mention the user in the reply (defaults to false)
     */
    async send(reply = true, mention = false) {
        if (!this.sendback)
            throw new Error('No sendback function, so could not run Embed.send()');
        return await this.sendback(this, reply, mention);
    }
    /**
     * Renders the embed
     * @returns {APIEmbed}
     */
    render() {
        return this.obj;
    }
}
exports.Embed = Embed;
