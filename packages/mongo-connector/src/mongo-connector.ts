import { MongoClient } from "mongodb";

function connect() {
    const host = process.env.MONGO_HOST ? encodeURIComponent(process.env.MONGO_HOST) : encodeURIComponent("localhost");
    const port = process.env.MONGO_PORT || 27017;
    const user = process.env.MONGO_USER ? encodeURIComponent(process.env.MONGO_USER) : "";
    const password = process.env.MONGO_PASSWORD ? encodeURIComponent(process.env.MONGO_PASSWORD) : "";
    const credentials = user != "" && password != "" ? `${user}:${password}@` : '';
    const connectionURL = `mongodb://${credentials}${host}:${port}/admin`;
    return MongoClient.connect(connectionURL, { useNewUrlParser: true });
}

export function status() {
    return connect()
        .then(_ => true)
        .catch(reason => reason)
};

export function exec(operation: (client: MongoClient) => Promise<any>) {
    return new Promise((resolve, reject) => {
        connect()
            .then(client => operation(client)
                .then(results => { client.close(); return resolve(results); })
                .catch(reason => { client.close(); return reject(reason); }))
            .catch(reason => reject(reason))
    });
}