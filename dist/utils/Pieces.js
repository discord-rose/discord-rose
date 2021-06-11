"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pieces = {
    generate: (obj) => {
        const pieces = {};
        function generatePiece(toObj, key, working) {
            const val = key ? toObj[key] : toObj;
            if (typeof val !== 'object') {
                pieces[`${working ? `${working}.` : ''}${key}`] = val;
            }
            else {
                Object.keys(val).forEach(x => generatePiece(val, x, `${working ? `${working}.` : ''}${key}`));
            }
        }
        generatePiece(obj, '');
        return pieces;
    }
};
exports.default = Pieces;
