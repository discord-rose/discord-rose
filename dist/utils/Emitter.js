"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emitter = void 0;
const events_1 = require("events");
/**
 * EventEmitter but with mapped typings
 */
class Emitter extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.emit = this.emit;
    }
}
exports.Emitter = Emitter;
