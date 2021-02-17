import { APIEmbed, APIMessage } from "discord-api-types";

export class Embed {
  public obj: APIEmbed = {}
  constructor (private sendback?: (embed: Embed, reply: boolean) => Promise<APIMessage>) {}

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
    if (!this.obj.fields) this.obj.fields = []
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
   * Sets the image
   * @param url URL of image
   * @param width Optional fixed width
   * @param height Optional fixed height
   */
  image (url: string, width?: number, height?: number) {
    this.obj.image = {
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
    if (!this.obj.footer) this.obj.footer = { text: '' }
    if (text) this.obj.footer.text = text
    if (icon) this.obj.footer.icon_url = icon

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
  send (reply: boolean = true) {
    if (!this.sendback) return
    return this.sendback(this, reply)
  }

  render () {
    return this.obj
  }
}