import { Request, Response } from "express";

import * as db from "../util/db";
import * as podcast from "./podcast";
import { QueryResult } from "pg";

type status = "IDLE" | "RUNNING";
export let status: status = "IDLE";
export let podcastCount: number;
export const batchDim: number = 1;
export let batchCount: number;
export let progress: number;

export function index(req: Request, res: Response) {
    db.status()
        .then(results => res.status(200).send(
            {
                status,
                dbStatus: results,
                podcastCount,
                batchDim,
                batchCount,
                progress
            }
        ))
        .catch(results => res.status(200).send(results))
}

export function analyze() {
    return new Promise((resolve, reject) => {
        if (status == "RUNNING") reject("Already running");
        status = "RUNNING";
        db.query("SELECT COUNT(*) FROM podcasts WHERE lastupdate < current_date - 7 or lastupdate is null;")
            .then(
                countQueryResults => {
                    const queryStrings: string[] = [];
                    podcastCount = countQueryResults.rows[0].count;
                    batchCount = Math.ceil(podcastCount / batchDim);
                    progress = 0;

                    for (progress; progress < 2; progress++) {
                        queryStrings.push(`SELECT itunesid FROM podcasts LIMIT ${batchDim} OFFSET ${progress}`);
                    }

                    return queryStrings
                        .map(querystring => db.query(querystring))
                        .reduce(batchReducer, Promise.resolve())
                        .then(_ => {
                            status = "IDLE";
                            resolve();
                        })
                        .catch(reason => {
                            status = "IDLE";
                            reject(reason);
                        })
                }
            )
    })

};

function analyzeBatch(batchQueryResults: QueryResult) {
    return Promise.all(
        batchQueryResults.rows
            .map(el => el.itunesid)
            .map(podcast.update)
            .map(promise => promise
                .then(results => ({ success: true, results }))
                .catch(reason => ({ success: false, reason }))
            ));
};

async function batchReducer(acc: Promise<void>, batchPromise: Promise<QueryResult>, i: number) {
    await acc;
    return batchPromise
        .then(batchQueryResults => {
            return analyzeBatch(batchQueryResults)
                .then(values => {
                    console.log(`end batch ${i}`);
                    return values;
                })
                .catch(reason => (console.log(reason)))
        })
}