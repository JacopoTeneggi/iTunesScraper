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
const HttpClient_1 = require("typed-rest-client/HttpClient");
let httpc = new HttpClient_1.HttpClient("itunes-scraper");
function request(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            httpc.get(url)
                .then(res => {
                const statusCode = res.message.statusCode;
                res.readBody()
                    .then(value => {
                    try {
                        const body = JSON.parse(value);
                        resolve({ statusCode, res, body });
                    }
                    catch (err) {
                        resolve({ statusCode, res, body: value });
                    }
                })
                    .catch(reason => { reject(reason); });
            })
                .catch(err => { return reject(err); });
        });
    });
}
exports.request = request;
;
