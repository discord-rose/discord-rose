"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadComms = exports.State = void 0;
const events_1 = require("events");
const UtilityFunctions_1 = require("../utils/UtilityFunctions");
const collection_1 = __importDefault(require("@discordjs/collection"));
var ThreadMethod;
(function (ThreadMethod) {
    ThreadMethod[ThreadMethod["COMMAND"] = 0] = "COMMAND";
    ThreadMethod[ThreadMethod["RESPONSE"] = 1] = "RESPONSE";
    ThreadMethod[ThreadMethod["TELL"] = 2] = "TELL";
})(ThreadMethod || (ThreadMethod = {}));
/**
 * State of a shard socket
 */
var State;
(function (State) {
    State[State["DISCONNECTED"] = 0] = "DISCONNECTED";
    State[State["CONNECTING"] = 1] = "CONNECTING";
    State[State["CONNECTED"] = 2] = "CONNECTED";
})(State = exports.State || (exports.State = {}));
/**
 * Middleman between all thread communications
 */
class ThreadComms extends events_1.EventEmitter {
    constructor() {
        super();
        this.comms = null;
        this.commands = new collection_1.default();
        /**
         * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
         */
        this.on = this.on;
        this.on('KILL', () => process.exit(5));
    }
    emit(event, data, resolve) {
        super.emit('*', { event, d: data }, resolve);
        return super.emit(event, data, resolve);
    }
    register(comms) {
        this.comms = comms;
        this.comms.on('message', (msg) => {
            switch (msg.op) {
                case ThreadMethod.COMMAND: {
                    this.emit(msg.e, msg.d, (data) => {
                        this._respond(msg.i, data);
                    });
                    break;
                }
                case ThreadMethod.RESPONSE: {
                    const command = this.commands.get(msg.i);
                    if (!command)
                        return;
                    this.commands.delete(msg.i);
                    command(msg.d);
                    break;
                }
                case ThreadMethod.TELL: {
                    this.emit(msg.e, msg.d, null);
                    break;
                }
            }
        });
    }
    _send(op, e, i, d) {
        var _a;
        (_a = this.comms) === null || _a === void 0 ? void 0 : _a.postMessage({
            op,
            e,
            i,
            d
        });
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
            const id = UtilityFunctions_1.generateID(this.commands.keyArray());
            this.commands.set(id, (dat) => {
                if (dat === null || dat === void 0 ? void 0 : dat.error)
                    resolve(new Error(dat.error));
                resolve(dat);
            });
            this._send(ThreadMethod.COMMAND, event, id, data);
            setTimeout(() => {
                if (this.commands.has(id)) {
                    this.commands.delete(id);
                    reject(new Error(`Didn't respond in time to COMMAND ${event}`));
                }
            }, 15e3);
        });
    }
    _respond(id, data) {
        this._send(ThreadMethod.RESPONSE, null, id, data);
    }
    /**
     * Tells the master something
     * @param event Event to send
     * @param data Data to send
     * @link https://github.com/discord-rose/discord-rose/wiki/Using-Clusters#creating-custom-events
     */
    tell(event, data) {
        this._send(ThreadMethod.TELL, event, null, data);
    }
}
exports.ThreadComms = ThreadComms;
