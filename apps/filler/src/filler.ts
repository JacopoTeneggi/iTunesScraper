import * as redis from "redis";
import { promisify } from "util";
import * as psql from "@itunes-scraper-sdk/psql-connector";

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST
});
const rpushAsync = promisify(redisClient.rpush).bind(redisClient);
const lremAsync = promisify(redisClient.lrem).bind(redisClient);

const mainQName = process.env.MAIN_Q_NAME;

psql.query("SELECT COUNT(*) FROM podcasts WHERE lastupdate < current_date - 7 or lastupdate is null;")
    .then(countQueryResults => {
        const querystrings: string[] = [];
        const count = countQueryResults.rows[0].count;
        const batchDim = 100;
        const batchCount = Math.ceil(count / batchDim);
        for (let i = 0; i < batchCount; i++) querystrings.push(`SELECT itunesid FROM podcasts LIMIT ${batchDim} OFFSET ${i}`);
        return Promise.all(
            querystrings
                .map(query => psql.query(query))
                .map(promise => promise
                    .then(async batchQueryResults => {
                        const item = batchQueryResults.rows.map(el => el.itunesid).join(",");
                        await lremAsync(mainQName, 0, item)
                        return rpushAsync(mainQName, item);
                    })
                    .catch(reason => reason))
        )
            .then(_ => { console.log("DONE"); redisClient.end(true); })
            .catch(reason => { console.log(reason); redisClient.end(true); })
    })
    .catch(reason => { console.log(reason); redisClient.end(true); });