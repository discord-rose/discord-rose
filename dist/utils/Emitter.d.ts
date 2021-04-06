/// <reference types="node" />
import { EventEmitter } from 'events';
interface MapType {
    [key: string]: any;
}
/**
 * EventEmitter but with mapped typings
 */
export declare class Emitter<MAP extends MapType> extends EventEmitter {
    on: <K extends keyof MAP>(event: K | symbol, listener?: (data: MAP[K]) => void) => this;
    once: <K extends keyof MAP>(event: K | symbol, listener?: (data: MAP[K]) => void) => this;
    emit: <K extends keyof MAP>(event: K | symbol, data: MAP[K]) => boolean;
    off: <K extends keyof MAP>(event: K | symbol, listener?: (data: MAP[K]) => void) => this;
    removeAllListeners: <K extends keyof MAP>(event?: K | symbol) => this;
}
export {};
