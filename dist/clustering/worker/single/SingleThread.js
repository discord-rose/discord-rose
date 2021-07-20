"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleThread = void 0;
const Thread_1 = require("../Thread");
const singleHandlers_1 = require("./singleHandlers");
/**
 * Thread interface for interacting with the master process from a worker
 */
class SingleThread extends Thread_1.Thread {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    constructor(worker) {
        super(worker, false);
        this.worker = worker;
        this.id = '0';
        const keys = Object.keys(singleHandlers_1.handlers);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.on(key, (data, resolve) => {
                var _a;
                (_a = singleHandlers_1.handlers[key]) === null || _a === void 0 ? void 0 : _a.bind(worker)(data, resolve);
            });
        }
    }
    /**
     * Sends a command to the master
     * @param event Event to send
     * @param data Data to send along
     * @returns Data back
     * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
     */
    async sendCommand(event, data) {
        return await new Promise((resolve, reject) => {
            this.emit(event, data, (res) => {
                if (res.error)
                    return reject(new Error(res.error));
                resolve(res);
            });
        });
    }
    /**
       * Tells the master something
       * @param event Event to send
       * @param data Data to send
       * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
       */
    tell(event, data) {
        this.emit(event, data, () => { });
    }
}
exports.SingleThread = SingleThread;
