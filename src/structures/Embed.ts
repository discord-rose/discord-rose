import { APIEmbed } from "discord-api-types";

export class Embed {
  public obj: APIEmbed = {}
  constructor (private sendback?: (embed: Embed, reply: boolean) => void) {}

  /**
   * Sets the color
   * @param color Color hex code
   */
  color (color: number) {
    this.obj.color = color

    return this
  }

  /**
   * Sets author
   * @param name Name of author
   * @param icon Author avatar icon
   * @param url URL anchored to the author name
   */
  author (name?: string, icon?: string, url?: string) {
    this.obj.author = {
      name,
      icon_url: icon,
      url
    }

    return this
  }

  /**
   * Sets the title
   * @param title Title name
   * @param url URL anchored to title name
   */
  title (title?: string, url?: string) {
    if (title) this.obj.title = title
    if (url) this.obj.url = url

    return this
  }
  
  /**
   * Sets description
   * @param desc Description
   */
  description (desc: string) {
    this.obj.description = desc

    return this
  }

  /**
   * Adds a field
   * @param name Fields title
   * @param value Fields value
   * @param inline Whether the field is inline
   */
  field (name: string, value: string, inline?: boolean) {
    this.obj.fields.push({
      name,
      value,
      inline
    })

    return this
  }

  /**
   * Sets the thumbnail
   * @param url URL of thumbnail
   * @param width Optional fixed width
   * @param height Optional fixed height
   */
  thumbnail (url: string, width?: number, height?: number) {
    this.obj.thumbnail = {
      url,
      width,
      height
    }

    return this
  }

  /**
   * Sets the footer
   * @param text Text for footer
   * @param icon Small icon on the bottom left
   */
  footer (text?: string, icon?: string) {
    this.obj.footer = {
      text,
      icon_url: icon
    }

    return this
  }

  /**
   * Sets the timestamp
   * @param date Date to set, leave blank for current time
   */
  timestamp (date: Date = new Date()) {
    this.obj.timestamp = date.toISOString()

    return this
  }

  /**
   * Sends embed to channel
   * @param reply Whether or not to do so in an inline reply (defaults to true)
   */
  send (reply: boolean = false) {
    this.sendback(this, reply)
  }

  render () {
    return this.obj
  }
}