"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaults = void 0;
function defaults(events, worker) {
    events.on('USER_UPDATE', (user) => {
        if (user.id === worker.user.id)
            worker.user = user;
    });
}
exports.defaults = defaults;
