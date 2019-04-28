"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
function connect() {
    const host = process.env.MONGO_HOST ? encodeURIComponent(process.env.MONGO_HOST) : encodeURIComponent("localhost");
    const port = process.env.MONGO_PORT || 27017;
    const user = process.env.MONGO_USER ? encodeURIComponent(process.env.MONGO_USER) : "";
    const password = process.env.MONGO_PASSWORD ? encodeURIComponent(process.env.MONGO_PASSWORD) : "";
    const credentials = user != "" && password != "" ? `${user}:${password}@` : '';
    const connectionURL = `mongodb://${credentials}${host}:${port}/admin`;
    return mongodb_1.MongoClient.connect(connectionURL, { useNewUrlParser: true });
}
function status() {
    return connect()
        .then(_ => true)
        .catch(reason => reason);
}
exports.status = status;
;
function exec(operation) {
    return new Promise((resolve, reject) => {
        connect()
            .then(client => operation(client)
            .then(results => { client.close(); return resolve(results); })
            .catch(reason => { client.close(); return reject(reason); }))
            .catch(reason => reject(reason));
    });
}
exports.exec = exec;
//# sourceMappingURL=index.js.map