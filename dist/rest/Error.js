"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestError = void 0;
/**
 * An error in a Discord request
 * @extends {Error}
 */
class RestError extends Error {
    constructor(response) {
        var _a;
        super();
        this.name = 'DiscordAPIError';
        this.message = response.message;
        this.status = Number((_a = response.message) === null || _a === void 0 ? void 0 : _a.split(':')[0]);
        this.code = response.code;
    }
}
exports.RestError = RestError;
