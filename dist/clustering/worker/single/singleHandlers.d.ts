import { ThreadEvents, ResolveFunction } from '../../ThreadComms';
import { Worker } from '../../../typings/lib';
import { SingleWorker } from './SingleWorker';
export declare const handlers: {
    [key in keyof ThreadEvents]?: (this: Worker & SingleWorker, data: ThreadEvents[key]['send'], resolve: ResolveFunction<key>) => void | Promise<void>;
};
