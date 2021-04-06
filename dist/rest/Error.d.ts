/**
 * An error in a Discord request
 * @extends {Error}
 */
export declare class RestError extends Error {
    /**
     * Status code for error
     * @type {number}
     */
    status: number;
    /**
     * Error code
     * @type {number}
     */
    code: number;
    name: string;
    constructor(response: any);
}
