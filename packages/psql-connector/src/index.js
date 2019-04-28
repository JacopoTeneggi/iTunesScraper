"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const credentials = {
    "user": process.env.POSTGRES_USER,
    "host": process.env.POSTGRES_DB_HOST || "localhost",
    "database": process.env.POSTGRES_DB_NAME,
    "password": process.env.POSTGRES_PASSWORD
};
const pool = new pg_1.Pool(credentials);
function query(text, params = []) {
    return __awaiter(this, void 0, void 0, function* () {
        return pool.query(text, params)
            .then(results => results)
            .catch(reason => reason);
    });
}
exports.query = query;
;
function status() {
    return __awaiter(this, void 0, void 0, function* () {
        return query("SELECT NOW();")
            .then(_ => true)
            .catch(reason => reason);
    });
}
exports.status = status;
;
//# sourceMappingURL=index.js.map