"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscResource = void 0;
/**
 * Miscellanious resource
 */
class MiscResource {
    constructor(rest) {
        this.rest = rest;
    }
    /**
     * Get gateway endpoint
     */
    async getGateway() {
        return await this.rest.request('GET', '/gateway/bot');
    }
}
exports.MiscResource = MiscResource;
