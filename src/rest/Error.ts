/**
 * An error in a Discord request
 * @extends {Error}
 */
export class RestError extends Error {
  /**
   * Status code for error
   * @type {number}
   */
  public status: number

  /**
   * Error code
   * @type {number}
   */
  public code: number

  public name = 'DiscordAPIError'

  constructor (response: any) {
    super()
    this.message = response.message
    this.status = Number(response.message?.split(':')[0])
    this.code = response.code
  }
}
