ephemeralimport {APIEmbed, APIMessage} from 'discord-api-types'
import Colors from '../utils/webColors'

global.ROSE_DEFAULT_EMBED = {}

/**
 * Discord Embed
 */
export class Embed<Res extends APIMessage | null = APIMessage> {
  public obj: APIEmbed = Object.assign({}, global.ROSE_DEFAULT_EMBED)
  constructor(private readonly sendback?: (embed: Embed<Res>, reply: boolean, mention: boolean, ephermal: boolean) => Promise<Res>) { }

  /**
   * Sets the color
   * @param color Color hex code
   */
  color(color: keyof typeof Colors | number): this {
    this.obj.color = Colors[color] ?? color

    return this
  }

  /**
   * Sets author
   * @param name Name of author
   * @param icon Author avatar icon
   * @param url URL anchored to the author name
   */
  author(name?: string, icon?: string, url?: string): this {
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
  title(title?: string, url?: string): this {
    if (title) this.obj.title = title
    if (url) this.obj.url = url

    return this
  }

  /**
   * Sets description
   * @param desc Description
   */
  description(desc: string): this {
    this.obj.description = desc

    return this
  }

  /**
   * Adds a field
   * @param name Fields title
   * @param value Fields value
   * @param inline Whether the field is inline
   */
  field(name: string, value: string, inline?: boolean): this {
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
  thumbnail(url: string, width?: number, height?: number): this {
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
  image(url: string, width?: number, height?: number): this {
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
  footer(text?: string, icon?: string): this {
    if (!this.obj.footer) this.obj.footer = {text: ''}
    if (text) this.obj.footer.text = text
    if (icon) this.obj.footer.icon_url = icon

    return this
  }

  /**
   * Sets the timestamp
   * @param date Date to set, leave blank for current time
   */
  timestamp(date: Date = new Date()): this {
    this.obj.timestamp = date.toISOString()

    return this
  }

  /**
   * Sends embed to channel
   * @param reply Whether or not to do so in an inline reply (defaults to true)
   * @param mention Whether or not to mention the user in the reply (defaults to false)
   */
  async send(reply: boolean = true, mention = false, ephermal = false): Promise<Res> {
    if (!this.sendback) throw new Error('No sendback function, so could not run Embed.send()')
    return await this.sendback(this, reply, mention, ephermal)
  }

  /**
   * Renders the embed
   * @returns
   */
  render(): APIEmbed {
    return this.obj
  }
}
