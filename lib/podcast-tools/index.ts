import { lookup } from "./lib/iTunes";
import { request } from "./lib/request";
import { arrayToPostgres } from "./lib/arrayToPostgre";
import { query } from "../psql-connector/index";

import vendors from "./vendors.json";

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

export class PodcastFeed {
    constructor(
        readonly statusCode: number = 0,
        readonly body: string = ""
    ) { }
}

export interface StateConfig {
    iTunesID?: number,
    isDown?: boolean,
    title?: string,
    author?: string,
    feedUrl?: string,
    releaseDate?: string,
    genreIDs?: number[],
    country?: string,
    trackCount?: number,
    feed?: PodcastFeed,
    enclosures?: Enclosure[],
    success?: boolean,
    steps?: Step[]
}

export class State {
    public iTunesID: number;
    public isDown: boolean;
    public title: string;
    public author: string;
    public feedUrl: string;
    public releaseDate: string;
    public genreIDs: number[];
    public country: string;
    public trackCount: number;
    public feed: PodcastFeed;
    public enclosures: Enclosure[];
    public success: boolean;
    public steps: Step[];

    constructor(stateConfig: StateConfig) {
        this.iTunesID = stateConfig.iTunesID || -1;
        this.isDown = stateConfig.isDown || false;
        this.title = stateConfig.title || "";
        this.author = stateConfig.author || "";
        this.feedUrl = stateConfig.feedUrl || "";
        this.releaseDate = stateConfig.releaseDate || "";
        this.genreIDs = stateConfig.genreIDs || [];
        this.country = stateConfig.country || "";
        this.trackCount = stateConfig.trackCount || -1;
        this.feed = stateConfig.feed || new PodcastFeed();
        this.enclosures = stateConfig.enclosures || [];
        this.success = stateConfig.success || false;
        this.steps = stateConfig.steps || [];
    }
}


export async function init(state: State): Promise<State> {
    const iTunesID = state.iTunesID;
    return new Promise((resolve, reject) => {
        lookup(iTunesID)
            .then(lookupResponse => {
                if (lookupResponse.body.resultCount == 0) resolve(new State({ iTunesID, isDown: true, steps: state.steps }));
                const podcast = lookupResponse.body.results[0];
                resolve(new State({
                    iTunesID,
                    isDown: false,
                    title: podcast.collectionName,
                    author: podcast.artistName,
                    feedUrl: podcast.feedUrl,
                    releaseDate: podcast.releaseDate,
                    genreIDs: podcast.genreIds,
                    country: podcast.country,
                    trackCount: podcast.trackCount,
                    steps: state.steps
                }))
            })
            .catch(reason => { reject(reason); })
    })
};

export async function extractHostings(state: State): Promise<State> {
    return new Promise((resolve, reject) => {
        if (typeof state.feedUrl === "undefined" || state.isDown) resolve(state);
        request(state.feedUrl)
            .then(feedResponse => {
                state.feed = new PodcastFeed(feedResponse.statusCode, feedResponse.body);
                const enclosureRegex = /(<enclosure)[^>]*(type="audio\/[\S]*")[^>]*(<\/enclosure>|[\/]*>|)/g;
                let match: RegExpExecArray | null;
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
            .then(_ => { resolve(state); })
            .catch(reason => { reject(reason); })
    });
};

export const update = (iTunesID: number) =>
    ([init, extractHostings, loadPodcast]
        .reduce(
            updateReducer,
            Promise.resolve(new State(
                {
                    iTunesID: iTunesID,
                    isDown: true,
                    steps: [{ name: "start", endTime: Date.now(), status: "SUCCEDED" }]
                }
            ))));


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
    return podcast.enclosures.reduce((acc, value) => [...acc, value.vendor], <string[]>[]);
};


