import { Request, Response } from "express";

import * as psql from "../../../lib/psql-connector/index";
import * as mongo from "../../../lib/mongo-connector/index";
import * as podcast from "../../../lib/podcast-tools/index";
import { QueryResult } from "pg";
import v1 from "uuid/v1";

type status = "IDLE" | "RUNNING";
export let status: status = "IDLE";
export let podcastCount: number;
export const batchDim: number = 100;
export let batchCount: number;
export let progress: number;

let runID: string;

export function index(_: Request, res: Response) {
    Promise.all(
        [psql.status(), mongo.status()]
            .map(promise => promise
                .then(_ => ({ status: true }))
                .catch(reason => ({ status: false, reason }))
            )
    ).then(results => (res.status(200).send(
        {
            status,
            dbStatus: results,
            podcastCount,
            batchDim,
            batchCount,
            progress
        })))
}

export function analyze() {
    return new Promise((resolve, reject) => {
        if (status == "RUNNING") reject("Already running");
        status = "RUNNING";
        runID = v1();
        psql.query("SELECT COUNT(*) FROM podcasts WHERE lastupdate < current_date - 7 or lastupdate is null;")
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
                        .map(querystring => psql.query(querystring))
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
            .catch(reason => reject(reason));
    })

};

function analyzeBatch(batchQueryResults: QueryResult) {
    const batchID = v1();
    return Promise.all(
        batchQueryResults.rows
            .map(el => el.itunesid)
            .map(podcast.update)
            .map(promise => promise
                .then(state => stateToRecord(state, true, batchID))
                .catch(state => stateToRecord(state, false, batchID))
            ))
};

async function batchReducer(acc: Promise<void>, batchPromise: Promise<QueryResult>, i: number) {
    await acc;
    return batchPromise
        .then(batchQueryResults => {
            return analyzeBatch(batchQueryResults)
                .then(records => Promise.all(
                    records
                        .map(record => mongo.exec(client => client.db("podcasts").collection("run-data").insertOne(record)))
                ))
                .catch(reason => console.log(reason))
        })
};

function stateToRecord(state: podcast.State, success: boolean, batchID: string) {
    return {
        runID,
        batchID,
        success,
        isDown: state.isDown,
        itunesid: state.iTunesID,
        title: state.title,
        author: state.author,
        feedUrl: state.feedUrl,
        steps: state.steps
    }
};