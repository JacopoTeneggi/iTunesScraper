"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayToPostgres = (array) => {
    let out = "{ ";
    const l = array.length;
    let i = 0;
    for (i; i < (l - 1); i++) {
        out += `${array[i]} , `;
    }
    out += `${array[i]} }`;
    return out;
};
