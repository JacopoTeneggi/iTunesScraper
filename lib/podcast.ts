import { lookup } from "./iTunesTools";
import { request } from "../util/request";
import { arrayToPostgres } from "../util/arrayToPostgre";
import { query } from "../util/db";
import { QueryResult } from "pg";
import { RecordOf, Record, List, Map } from "immutable";

import vendors from "../vendors.json";

export interface IPodcastFeed {
    statusCode: number,
    body: string
}

type status = "PENDING" | "FAILED" | "SUCCEDED";

type Enclosure = {
    enclosure: string,
    vendor: string
}

type Step = {
    name: string,
    status: status,
    message: string
}

type StateProps = {
    iTunesID: number,
    isDown: boolean,
    title: string,
    author: string,
    feedUrl: string,
    releaseDate: string,
    genreIDs: List<number>,
    country: string,
    trackCount: number,
    feed: Map<string, any>,
    enclosures: List<Enclosure>,
    steps: List<Step>
}

const defaultStateProps: StateProps = {
    iTunesID: 0,
    isDown: false,
    title: "",
    author: "",
    feedUrl: "",
    releaseDate: "",
    genreIDs: List(),
    country: "",
    trackCount: 0,
    feed: Map(),
    enclosures: List(),
    steps: List()
}

export type State = RecordOf<StateProps>;
export const makeState: Record.Factory<StateProps> = Record(defaultStateProps);

export async function init(state: State): Promise<State> {
    const iTunesID = state.iTunesID;
    return new Promise((resolve, reject) => {
        lookup(iTunesID)
            .then(lookupResponse => {
                if (lookupResponse.body.resultCount == 0) return makeState({ iTunesID: iTunesID, isDown: true })
                const podcast = lookupResponse.body.results[0];
                resolve(makeState({
                    iTunesID: iTunesID,
                    isDown: false,
                    title: podcast.collectionName,
                    author: podcast.artistName,
                    feedUrl: podcast.feedUrl,
                    releaseDate: podcast.releaseDate,
                    genreIDs: podcast.genreIDs,
                    country: podcast.country,
                    trackCount: podcast.trackCount
                }));
            })
            .catch(reason => { reject(reason); })
    })
};

export async function extractHostings(state: State): Promise<State> {
    return new Promise((resolve, reject) => {
        console.log(state.feedUrl);
        if (state.feedUrl == "") return resolve(state);
        request(state.feedUrl)
            .then(feedResponse => {
                state.feed.set("statusCode", feedResponse.statusCode);
                if (feedResponse.statusCode == 200) state.feed.set("body", feedResponse.body)
                const body = state.feed.get("body");
                const enclosureRegex = /(<enclosure)[^>]*(type="audio\/[\S]*")[^>]*(<\/enclosure>|[\/]*>|)/g;
                let match: RegExpExecArray;
                while ((match = enclosureRegex.exec(body)) != null) state.enclosures.push({
                    enclosure: match[0],
                    vendor: matchVendor(match[0], Object.keys(vendors), vendors)
                });
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
                arrayToPostgres(state.genreIDs.toArray()),
                state.country,
                state.trackCount,
                arrayToPostgres(reduceVendors(state)),
                state.iTunesID
            ]
            break
    }

    return new Promise((resolve, reject) => {
        query(queryText, queryParams)
            .then(() => { resolve(state); })
            .catch(reason => { reject(reason); })
    });
}

export async function update(iTunesID: number) {
    return [init, extractHostings, loadPodcast].reduce((acc, step) => {
        return acc
            .then(state => step(state)
                .then(state => { return Promise.resolve(state); })
                .catch(reason => { return Promise.reject(reason); }))
            .catch(reason => { return Promise.reject(reason); })
    }, Promise.resolve(makeState({ iTunesID: iTunesID })))
}

export function matchVendor(target: string, keys: string[], vendors: any): string {
    return target.indexOf(keys[0]) == -1 ? matchVendor(target, keys.slice(1), vendors) : vendors[keys[0]];
};

function reduceVendors(podcast: State) {
    return podcast.enclosures.reduce((acc, value) => [...acc, value.vendor], []);
}


