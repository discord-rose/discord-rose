/**
 * An error in a Discord request
 * @extends {Error}
 */
export declare class RestError extends Error {
    /**
     * Status code for error
     */
    status: number;
    /**
     * Error code
     */
    code: number;
    /**
     * Path of request
     */
    path: string;
    name: string;
    constructor(response: any, path: string);
}
