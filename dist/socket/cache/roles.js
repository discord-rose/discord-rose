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
        const role = Object.assign({}, r);
        const guildRoles = worker.guildRoles.get(role.guild_id);
        if (!guildRoles)
            return;
        let currentRole = guildRoles.get(role.role.id);
        if (!currentRole)
            return;
        currentRole.name = role.role.name;
        currentRole.permissions = role.role.permissions;
        currentRole.color = role.role.color;
        currentRole.hoist = role.role.hoist;
        currentRole.mentionable = role.role.mentionable;
        currentRole.position = role.role.position;
        if (worker.options.cacheControl.roles) {
            const newRole = {};
            worker.options.cacheControl.roles.forEach(key => {
                newRole[key] = currentRole[key];
            });
            newRole.id = currentRole.id;
            currentRole = newRole;
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
