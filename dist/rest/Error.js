"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestError = void 0;
/**
 * An error in a Discord request
 * @extends {Error}
 */
class RestError extends Error {
    constructor(response) {
        super();
        this.name = 'DiscordAPIError';
        this.message = response.message;
        this.status = response.status;
        this.code = response.code;
    }
}
exports.RestError = RestError;