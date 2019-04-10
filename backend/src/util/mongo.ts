import { MongoClient } from "mongodb";

const user = encodeURIComponent("podcasts");
const password = encodeURIComponent("1234");
const authMechanism = "DEFAULT";
const host = process.env.MONGO_HOST || "localhost";

const connectionURL = `mongodb://${user}:${password}@${host}:27017/admin?authMechanism=${authMechanism}`;

function connect() {
    return MongoClient.connect(connectionURL, { useNewUrlParser: true });
}

export function status() {
    return connect()
        .then(_ => true)
        .catch(reason => reason)
};

export function exec(operation: (client: MongoClient) => Promise<any>) {
    return connect()
        .then(client => operation(client)
            .then(results => { client.close(); return results; })
            .catch(reason => { client.close(); return reason; }))
        .catch(reason => reason);
}