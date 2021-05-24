import { Snowflake } from 'discord-api-types'

/**
 * Promisify a waiting time
 * @param time Time to wait
 */
export async function wait (time: number): Promise<true> {
  return await new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

/**
 * Chunks shards into a 3D array
 * @param total Total amount of shards
 * @param perCluster Amount of shards per cluster
 */
export function chunkShards (total: number, perCluster: number): number[][] {
  const entries: number[] = Array(total).fill(null).reduce((a, _, i) => a.concat([i]), [])
  const chunkSize = (Math.ceil(total / perCluster))

  const result: number[][] = []
  const amount = Math.floor(entries.length / chunkSize)
  const mod = entries.length % chunkSize

  for (let i = 0; i < chunkSize; i++) {
    result[i] = entries.splice(0, i < mod ? amount + 1 : amount)
  }

  return result
}

/**
 * Generates command/response ID's for cluster workers
 * @param currently Current array of ID's (ensure's no duplicated)
 */
export function generateID (currently: string[]): string {
  const current = `${Date.now()}${(Math.random() * 10000).toFixed(0)}`
  if (currently.includes(current)) return generateID(currently)
  return current
}

/**
 * Get the shard ID for a guild
 * @param id ID of guild
 * @param totalShards Total shards
 */
export function guildShard (id: Snowflake, totalShards: number): number {
  return Number((BigInt(id) >> BigInt(22)) % BigInt(totalShards))
}

export function resolveString (data: any): string {
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.join(', ')

  return String(data)
}

/**
 * Traverses through all elements and nested elements of an object.
 * @param obj The object to traverse.
 * @param callback A callback that fires for every element of the object.
 */
export function traverseObject (obj: object, callback: (obj: {[key: string]: any}) => void): void {
  callback(obj)
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') traverseObject(obj[key], callback)
  })
}
