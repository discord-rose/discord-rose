/**
 * An error in a Discord request
 * @extends {Error}
 */
export class RestError extends Error {
  /**
   * Status code for error
   */
  public status: number

  /**
   * Error code
   */
  public code: number

  public name = 'DiscordAPIError'

  constructor (response: any) {
    super()
    this.message = response.message
    this.status = response.status
    this.code = response.code
  }
}
