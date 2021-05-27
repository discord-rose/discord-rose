"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverseObject = exports.resolveString = exports.guildShard = exports.generateID = exports.chunkShards = exports.wait = void 0;
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
/**
 * Get the shard ID for a guild
 * @param id ID of guild
 * @param totalShards Total shards
 */
function guildShard(id, totalShards) {
    return Number((BigInt(id) >> BigInt(22)) % BigInt(totalShards));
}
exports.guildShard = guildShard;
function resolveString(data) {
    if (typeof data === 'string')
        return data;
    if (Array.isArray(data))
        return data.join(', ');
    return String(data);
}
exports.resolveString = resolveString;
/**
 * Traverses through all elements and nested elements of an object.
 * @param obj The object to traverse.
 * @param callback A callback that fires for every element of the object.
 */
function traverseObject(obj, callback) {
    callback(obj);
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object')
            traverseObject(obj[key], callback);
    });
}
exports.traverseObject = traverseObject;
