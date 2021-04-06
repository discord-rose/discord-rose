import { ThreadEvents, ResolveFunction } from '../ThreadComms';
import { Cluster } from './Cluster';
export declare const handlers: {
    [key in keyof ThreadEvents]?: (this: Cluster, data: ThreadEvents[key]['send'], resolve: ResolveFunction<key>) => void | Promise<void>;
};
