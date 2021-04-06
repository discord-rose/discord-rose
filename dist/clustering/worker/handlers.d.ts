import { ThreadEvents, ResolveFunction } from '../ThreadComms';
import { Thread } from './Thread';
export declare const handlers: {
    [key in keyof ThreadEvents]?: (this: Thread, data: ThreadEvents[key]['send'], resolve: ResolveFunction<key>) => void | Promise<void>;
};
