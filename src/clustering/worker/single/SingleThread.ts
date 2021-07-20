import { Thread } from '../Thread'
import { SingleWorker } from './SingleWorker'

import { handlers } from './singleHandlers'
import { ThreadEvents } from '../../ThreadComms'

/**
 * Thread interface for interacting with the master process from a worker
 */
export class SingleThread extends Thread {
  public id: string = '0'

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  constructor (public worker: SingleWorker) {
    super(worker, false)

    const keys = Object.keys(handlers)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof ThreadEvents

      this.on(key, (data, resolve) => {
        handlers[key]?.bind(worker)(data, resolve)
      })
    }
  }

  /**
   * Sends a command to the master
   * @param event Event to send
   * @param data Data to send along
   * @returns Data back
   * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
   */
  public async sendCommand<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): Promise<ThreadEvents[K]['receive']> {
    return await new Promise((resolve, reject) => {
      this.emit(event as any, data, (res) => {
        if (res.error) return reject(new Error(res.error))

        resolve(res)
      })
    })
  }

  /**
     * Tells the master something
     * @param event Event to send
     * @param data Data to send
     * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
     */
  public tell<K extends keyof ThreadEvents>(event: K, data: ThreadEvents[K]['send']): void {
    this.emit(event as any, data, () => {})
  }
}
