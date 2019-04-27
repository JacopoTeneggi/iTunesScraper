"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const iTunes_1 = require("./lib/iTunes");
const request_1 = require("./lib/request");
const arrayToPostgre_1 = require("./lib/arrayToPostgre");
const psql_connector_1 = require("psql-connector");
const vendors_json_1 = __importDefault(require("./vendors.json"));
class PodcastFeed {
    constructor(statusCode = 0, body = "") {
        this.statusCode = statusCode;
        this.body = body;
    }
}
exports.PodcastFeed = PodcastFeed;
class State {
    constructor(stateConfig) {
        this.isDown = false;
        this.title = "";
        this.author = "";
        this.feedUrl = "";
        this.releaseDate = "";
        this.genreIDs = [];
        this.country = "";
        this.trackCount = -1;
        this.enclosures = [];
        this.success = false;
        this.steps = [];
        this.iTunesID = stateConfig.iTunesID || -1;
        this.isDown = stateConfig.isDown || false;
        this.title = stateConfig.title || "";
        this.author = stateConfig.author || "";
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
exports.State = State;
function init(state) {
    return __awaiter(this, void 0, void 0, function* () {
        const iTunesID = state.iTunesID;
        return new Promise((resolve, reject) => {
            iTunes_1.lookup(iTunesID)
                .then(lookupResponse => {
                if (lookupResponse.body.resultCount == 0)
                    resolve(new State({ isDown: true }));
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
                    trackCount: podcast.trackCount
                }));
            })
                .catch(reason => { reject(reason); });
        });
    });
}
exports.init = init;
;
function extractHostings(state) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (typeof state.feedUrl === "undefined")
                resolve(state);
            request_1.request(state.feedUrl)
                .then(feedResponse => {
                state.feed = new PodcastFeed(feedResponse.statusCode, feedResponse.body);
                const enclosureRegex = /(<enclosure)[^>]*(type="audio\/[\S]*")[^>]*(<\/enclosure>|[\/]*>|)/g;
                let match;
                while ((match = enclosureRegex.exec(state.feed.body)) != null) {
                    state.enclosures.push({
                        enclosure: match[0],
                        vendor: matchVendor(match[0], Object.keys(vendors_json_1.default), vendors_json_1.default)
                    });
                }
                ;
                resolve(state);
            })
                .catch(reason => { reject(reason); });
        });
    });
}
exports.extractHostings = extractHostings;
function loadPodcast(state) {
    return __awaiter(this, void 0, void 0, function* () {
        let queryText;
        let queryParams;
        switch (state.isDown) {
            case true:
                queryText = "UPDATE Podcasts SET feeddown = $1 WHERE itunesid = $2;";
                queryParams = [
                    state.isDown.toString(),
                    state.iTunesID
                ];
                break;
            case false:
                queryText = "UPDATE Podcasts SET feeddown = $1, title = $2, authorname = $3, feedurl = $4, releasedate = $5, lastupdate = $6, genreids = $7, country = $8, trackcount = $9, hostingvendors = $10 WHERE itunesid = $11;";
                queryParams = [
                    state.isDown.toString(),
                    state.title,
                    state.author,
                    state.feedUrl,
                    state.releaseDate,
                    new Date().toISOString(),
                    arrayToPostgre_1.arrayToPostgres(state.genreIDs),
                    state.country,
                    state.trackCount,
                    arrayToPostgre_1.arrayToPostgres(reduceVendors(state)),
                    state.iTunesID
                ];
                break;
        }
        return new Promise((resolve, reject) => {
            psql_connector_1.query(queryText, queryParams)
                .then(_ => { resolve(state); })
                .catch(reason => { reject(reason); });
        });
    });
}
exports.loadPodcast = loadPodcast;
;
exports.update = (iTunesID) => ([init, extractHostings, loadPodcast]
    .reduce(updateReducer, Promise.resolve(new State({
    iTunesID: iTunesID,
    isDown: true,
    steps: [{ name: "start", endTime: Date.now(), status: "SUCCEDED" }]
}))));
function updateReducer(acc, step) {
    return acc
        .then(state => step(state)
        .then(state => {
        const stepData = {
            name: step.name,
            endTime: Date.now(),
            status: "SUCCEDED",
        };
        state.steps.push(stepData);
        return Promise.resolve(state);
    })
        .catch(reason => {
        const stepData = {
            name: step.name,
            endTime: Date.now(),
            status: "FAILED",
            error: reason
        };
        state.steps.push(stepData);
        return Promise.reject(state);
    }));
}
;
function matchVendor(target, keys, vendors) {
    return target.indexOf(keys[0]) == -1 ? matchVendor(target, keys.slice(1), vendors) : vendors[keys[0]];
}
exports.matchVendor = matchVendor;
;
function reduceVendors(podcast) {
    return podcast.enclosures.reduce((acc, value) => [...acc, value.vendor], []);
}
;
