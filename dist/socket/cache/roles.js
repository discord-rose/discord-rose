"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roles = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
function roles(events, worker) {
    worker.guildRoles = new collection_1.default();
    events.on('GUILD_ROLE_CREATE', (r) => {
        const role = Object.assign({}, r);
        let guildRoles = worker.guildRoles.get(role.guild_id);
        if (!guildRoles) {
            guildRoles = new collection_1.default();
            worker.guildRoles.set(role.guild_id, guildRoles);
        }
        if (worker.options.cacheControl.roles) {
            const newRole = {};
            worker.options.cacheControl.roles.forEach(key => {
                newRole[key] = role.role[key];
            });
            newRole.id = role.role.id;
            role.role = newRole;
        }
        guildRoles.set(role.role.id, role.role);
    });
    events.on('GUILD_ROLE_UPDATE', (r) => {
        const role = r.role;
        const guildRoles = worker.guildRoles.get(r.guild_id);
        if (!guildRoles)
            return;
        const currentRole = guildRoles.get(role.id);
        if (!currentRole)
            return;
        if (worker.options.cacheControl.roles) {
            worker.options.cacheControl.roles.forEach(key => {
                currentRole[key] = role[key];
            });
            currentRole.id = role.id;
        }
        else {
            Object.keys(role).forEach(key => {
                currentRole[key] = role[key];
            });
        }
        guildRoles.set(currentRole.id, currentRole);
    });
    events.on('GUILD_ROLE_DELETE', (role) => {
        const guildRoles = worker.guildRoles.get(role.guild_id);
        guildRoles === null || guildRoles === void 0 ? void 0 : guildRoles.delete(role.role_id);
    });
    events.on('GUILD_DELETE', (guild) => {
        if (guild.unavailable)
            return;
        worker.guildRoles.delete(guild.id);
    });
}
exports.roles = roles;
