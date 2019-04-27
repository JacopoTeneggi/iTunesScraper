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
const request_1 = require("./request");
exports.ITUNESAPIURL = "https://itunes.apple.com";
function lookup(id, entity = "podcast") {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request(`${exports.ITUNESAPIURL}/lookup?id=${id}&entity=${entity}`)
            .then(response => response)
            .catch(err => err);
    });
}
exports.lookup = lookup;
