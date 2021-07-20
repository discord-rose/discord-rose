import { ThreadEvents, ResolveFunction } from '../../ThreadComms';
import { SingleWorker } from './SingleWorker';
export declare const handlers: {
    [key in keyof ThreadEvents]?: (this: SingleWorker, data: ThreadEvents[key]['send'], resolve: ResolveFunction<key>) => void | Promise<void>;
};
