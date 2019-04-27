"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
function connect() {
    var host = process.env.MONGO_HOST ? encodeURIComponent(process.env.MONGO_HOST) : encodeURIComponent("localhost");
    var port = process.env.MONGO_PORT || 27017;
    var user = process.env.MONGO_USER ? encodeURIComponent(process.env.MONGO_USER) : "";
    var password = process.env.MONGO_PASSWORD ? encodeURIComponent(process.env.MONGO_PASSWORD) : "";
    var credentials = user != "" && password != "" ? user + ":" + password + "@" : '';
    var connectionURL = "mongodb://" + credentials + host + ":" + port + "/admin";
    return mongodb_1.MongoClient.connect(connectionURL, { useNewUrlParser: true });
}
function status() {
    return connect()
        .then(function (_) { return true; })
        .catch(function (reason) { return reason; });
}
exports.status = status;
;
function exec(operation) {
    return connect()
        .then(function (client) { return operation(client)
        .then(function (results) { client.close(); return results; })
        .catch(function (reason) { client.close(); return reason; }); })
        .catch(function (reason) { return reason; });
}
exports.exec = exec;
