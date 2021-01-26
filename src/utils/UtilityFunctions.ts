
/**
 * Promisify a waiting time
 * @param time Time to wait
 */
export function wait(time: number): Promise<any> {
  return new Promise(resolve => {
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
export function chunkShards(total: number, perCluster: number): number[][] {
  const entries = Array(total).fill(null).reduce((a, _, i) => a.concat([i]), [])
  const chunkSize = (Math.ceil(total / perCluster))

  const result = []
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