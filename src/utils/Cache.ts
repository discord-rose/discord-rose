import Collection from '@discordjs/collection'

/**
 * Collection that deletes entries after a certain amount of time
 * @extends Collection
 */
export class Cache<K, V> extends Collection<K, V> {
  /**
   * Death rate in milliseconds
   */
  private time: number
  /**
   * Timeout store
   */
  private timeouts: Collection<any, NodeJS.Timeout>
  /**
   * Cache
   * @param {Number} time Death rate in milliseconds
   */
  constructor (time: number) {
    super()

    this.time = time
    this.timeouts = new Collection()
  }

  /**
   * Get
   * @param {*} key Get key
   */
  public get (key: K): V {
    if (!super.has(key)) return null

    this._resetTimer(key)

    return super.get(key)
  }

  /**
   * Set
   * @param {*} key Key
   * @param {*} val Value
   * @param {Function} cb Ran when item is deleted
   */
  public set (key: K, val: V, cb?: () => {}): any {
    super.set(key, val)

    this._resetTimer(key, cb)
  }

  public _resetTimer (key: K, cb?: () => {}): any {
    if (this.timeouts.has(key)) return this.timeouts.get(key).refresh()
    this.timeouts.set(key, setTimeout(() => {
      super.delete(key)
      this.timeouts.delete(key)
      if (cb) cb()
    }, this.time))
  }

  public delete (key: K): boolean {
    super.delete(key)
    const timeout = this.timeouts.get(key)
    if (timeout) clearTimeout(timeout)
    this.timeouts.delete(key)
    return true
  }
}