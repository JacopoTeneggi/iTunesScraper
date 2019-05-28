import * as redis from "redis";
import { promisify } from "util";
import * as psql from "@itunes-scraper-sdk/psql-connector";

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST
});
const rpushAsync = promisify(redisClient.rpush).bind(redisClient);
const lremAsync = promisify(redisClient.lrem).bind(redisClient);

const mainQName = process.env.MAIN_Q_NAME;

psql.query("SELECT itunesid FROM podcasts WHERE lastupdate < current_date - 30 or lastupdate is null ORDER BY itunesid;")
    .then(queryResults => {
        const batches: any[][] = [];
        const count = queryResults.rowCount;
        const batchDim = 100;
        const batchCount = Math.ceil(count / batchDim);
        for (let i = 0; i < batchCount; i++) batches.push(queryResults.rows.slice(i * batchDim, i * batchDim + batchDim));
        return Promise.all(
            batches
                .map(async batch => {
                    const item = batch.map(el => el.itunesid).join(",");
                    await lremAsync(mainQName, 0, item);
                    return rpushAsync(mainQName, item);
                })
        )
            .then(_ => { console.log("DONE"); redisClient.end(true); })
            .catch(reason => { console.log(reason); redisClient.end(true); })
    })
    .catch(reason => { console.log(reason); redisClient.end(true); });