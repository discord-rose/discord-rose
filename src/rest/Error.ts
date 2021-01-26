export class RestError extends Error {
  /**
   * Status code for error
   */
  public status: number
  public code: number

  name = 'DiscordAPIError'

  constructor (response: any) {
    super()
    this.message = response.message
    this.status = Number(response.message.split(':')[0])
    this.code = response.code
  }
}