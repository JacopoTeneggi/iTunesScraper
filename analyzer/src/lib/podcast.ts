import { lookup } from "./iTunes";
import { request } from "../util/request";
import { arrayToPostgres } from "../util/arrayToPostgre";
import { query } from "../util/psql";
import { RecordOf, Record, List, Map } from "immutable";

import vendors from "../vendors.json";

export interface IPodcastFeed {
    statusCode: number,
    body: string
}

type status = "FAILED" | "SUCCEDED";

interface Enclosure {
    enclosure: string,
    vendor: string
}

interface Step {
    name: string,
    status: string,
    endTime: number,
    error?: string
}

export interface State {
    iTunesID: number,
    isDown?: boolean,
    title?: string,
    author?: string,
    feedUrl?: string,
    releaseDate?: string,
    genreIDs?: number[],
    country?: string,
    trackCount?: number,
    feed?: {
        statusCode?: number,
        body?: string
    },
    enclosures?: Enclosure[],
    success?: boolean,
    steps?: Step[]
}

export async function init(state: State): Promise<State> {
    const iTunesID = state.iTunesID;
    return new Promise((resolve, reject) => {
        lookup(iTunesID)
            .then(lookupResponse => {
                if (lookupResponse.body.resultCount == 0) { state.isDown = true; }
                else {
                    const podcast = lookupResponse.body.results[0];
                    state.title = podcast.collectionName;
                    state.isDown = false;
                    state.author = podcast.artistName;
                    state.feedUrl = podcast.feedUrl;
                    state.releaseDate = podcast.releaseDate;
                    state.genreIDs = podcast.genreIds;
                    state.country = podcast.country;
                    state.trackCount = podcast.trackCount;
                }
                resolve(state);
            })
            .catch(reason => { reject(reason); })
    })
};

export async function extractHostings(state: State): Promise<State> {
    return new Promise((resolve, reject) => {
        if (typeof state.feedUrl === "undefined") return resolve(state);
        request(state.feedUrl)
            .then(feedResponse => {
                state.feed = {
                    statusCode: feedResponse.statusCode,
                    body: feedResponse.body
                }
                state.enclosures = [];
                const enclosureRegex = /(<enclosure)[^>]*(type="audio\/[\S]*")[^>]*(<\/enclosure>|[\/]*>|)/g;
                let match: RegExpExecArray;
                while ((match = enclosureRegex.exec(state.feed.body)) != null) {
                    state.enclosures.push({
                        enclosure: match[0],
                        vendor: matchVendor(match[0], Object.keys(vendors), vendors)
                    })
                };
                resolve(state);
            })
            .catch(reason => { reject(reason); })
    })
}

export async function loadPodcast(state: State): Promise<State> {
    let queryText: string;
    let queryParams: any[];
    switch (state.isDown) {
        case true:
            queryText = "UPDATE Podcasts SET feeddown = $1 WHERE itunesid = $2;";
            queryParams = [
                state.isDown.toString(),
                state.iTunesID
            ]
            break
        case false:
            queryText = "UPDATE Podcasts SET feeddown = $1, title = $2, authorname = $3, feedurl = $4, releasedate = $5, lastupdate = $6, genreids = $7, country = $8, trackcount = $9, hostingvendors = $10 WHERE itunesid = $11;";
            queryParams = [
                state.isDown.toString(),
                state.title,
                state.author,
                state.feedUrl,
                state.releaseDate,
                new Date().toISOString(),
                arrayToPostgres(state.genreIDs),
                state.country,
                state.trackCount,
                arrayToPostgres(reduceVendors(state)),
                state.iTunesID
            ]
            break
    }

    return new Promise((resolve, reject) => {
        query(queryText, queryParams)
            .then(results => { resolve(state); })
            .catch(reason => { reject(reason); })
    });
};

export const update = (iTunesID: number) =>
    ([init, extractHostings, loadPodcast].reduce(updateReducer, Promise.resolve({
        iTunesID: iTunesID,
        isDown: true,
        steps: [{ name: "start", endTime: Date.now(), status: "SUCCEDED" }]
    })));


function updateReducer(acc: Promise<State>, step: (state: State) => Promise<State>) {
    return acc
        .then(state => step(state)
            .then(state => {
                const stepData: Step = {
                    name: step.name,
                    endTime: Date.now(),
                    status: "SUCCEDED",
                }
                state.steps.push(stepData);
                return Promise.resolve(state);
            })
            .catch(reason => {
                const stepData: Step = {
                    name: step.name,
                    endTime: Date.now(),
                    status: "FAILED",
                    error: reason
                }
                state.steps.push(stepData);
                return Promise.reject(state);
            }))
};

export function matchVendor(target: string, keys: string[], vendors: any): string {
    return target.indexOf(keys[0]) == -1 ? matchVendor(target, keys.slice(1), vendors) : vendors[keys[0]];
};

function reduceVendors(podcast: State) {
    return podcast.enclosures.reduce((acc, value) => [...acc, value.vendor], []);
};


