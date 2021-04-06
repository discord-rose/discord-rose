"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guildShard = exports.generateID = exports.chunkShards = exports.wait = void 0;
/**
 * Promisify a waiting time
 * @param time Time to wait
 */
async function wait(time) {
    return await new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
}
exports.wait = wait;
/**
 * Chunks shards into a 3D array
 * @param total Total amount of shards
 * @param perCluster Amount of shards per cluster
 */
function chunkShards(total, perCluster) {
    const entries = Array(total).fill(null).reduce((a, _, i) => a.concat([i]), []);
    const chunkSize = (Math.ceil(total / perCluster));
    const result = [];
    const amount = Math.floor(entries.length / chunkSize);
    const mod = entries.length % chunkSize;
    for (let i = 0; i < chunkSize; i++) {
        result[i] = entries.splice(0, i < mod ? amount + 1 : amount);
    }
    return result;
}
exports.chunkShards = chunkShards;
/**
 * Generates command/response ID's for cluster workers
 * @param currently Current array of ID's (ensure's no duplicated)
 */
function generateID(currently) {
    const current = `${Date.now()}${(Math.random() * 10000).toFixed(0)}`;
    if (currently.includes(current))
        return generateID(currently);
    return current;
}
exports.generateID = generateID;
function guildShard(id, totalShards) {
    return Number((BigInt(id) >> BigInt(22)) % BigInt(totalShards));
}
exports.guildShard = guildShard;
