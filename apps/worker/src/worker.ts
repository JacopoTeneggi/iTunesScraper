import * as crypto from "crypto";
import { v1 as uuid } from "uuid";
import * as redis from "redis";
import { promisify } from "util";
import * as podcast from "@itunes-scraper-sdk/podcast-tools";
import * as mongo from "@itunes-scraper-sdk/mongo-connector";

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST
});
const brpoplpushAsync = promisify(redisClient.brpoplpush).bind(redisClient);
const setexAsync = promisify(redisClient.setex).bind(redisClient);
const llenAsync = promisify(redisClient.llen).bind(redisClient);
const lremAsync = promisify(redisClient.lrem).bind(redisClient);

const workerID = uuid();
const mainQName = process.env.MAIN_Q_NAME;
const processingQName = `${mainQName}:processing`;
const leasePrefix = `${mainQName}:leased:`;

function itemKey(item: string) {
    const hash = crypto.createHash("sha256");
    hash.update(item);
    return hash.digest("hex");
}

async function mainQSize() {
    return await llenAsync(mainQName);
};

async function mainEmpty() {
    const size = await mainQSize();
    const empty = size == 0 ? true : false;
    return empty;
};

async function lease() {
    const item: string = await brpoplpushAsync(mainQName, processingQName, 2);
    const key = itemKey(item);
    await setexAsync(`${leasePrefix}${key}`, 120, workerID);
    return item;
};

async function complete(item: string) {
    return await lremAsync(processingQName, 0, item)
};

function uploadRecord(state: podcast.State, success: boolean, key: string) {
    const record = {
        workerID,
        batchID: key,
        success,
        isDown: state.isDown,
        itunesid: state.iTunesID,
        title: state.title,
        author: state.author,
        feedUrl: state.feedUrl,
        steps: state.steps
    };
    return mongo.exec(client => client.db("podcasts").collection("run-data").insertOne(record))
};

function analyze(item: string) {
    const key = itemKey(item);
    console.log(key);
    return Promise.all(
        item.split(",")
            .map(string => +string)
            .map(podcast.update)
            .map(promise => promise
                .then(state => uploadRecord(state, true, key))
                .catch(state => uploadRecord(state, false, key))
            )
    )
};

function work() {
    return new Promise((resolve, reject) => {
        mainEmpty()
            .then(empty => {
                if (empty) return resolve(true);
                lease()
                    .then(item => analyze(item)
                        .then(_ => {
                            complete(item);
                        })
                        .catch(reason => reason))
                    .then(_ => resolve(work()))
                    .catch(reason => reject(reason))
            })
            .catch(reason => reject(reason));
    })
};

work()
    .then(_ => redisClient.end(true))
    .catch(_ => redisClient.end(true));
