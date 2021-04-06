import { CommandContext as ctx } from '../structures/CommandContext';
import { Worker as worker } from '../clustering/worker/Worker';
declare namespace DiscordRose {
    type CommandType = string | RegExp;
    interface CommandOptions {
        /**
         * Command to check for (string or RegExp)
         */
        command: CommandType;
        /**
         * Array of extra commands to check
         */
        aliases?: CommandType[];
        /**
         * Execute function
         */
        exec: (ctx: CommandContext) => void | Promise<void>;
    }
    interface CommandContext extends ctx {
    }
    type Worker = worker;
}
export = DiscordRose;
