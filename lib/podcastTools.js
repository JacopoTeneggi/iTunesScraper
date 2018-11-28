'use strict'

const httpRequest = require('./utils').httpRequest;
const arrayToPostgres = require('./utils').arrayToPostgres;
const iTunesTools = require('./iTunesTools');
const db = require('../db');

const parseResponse = (id, body) => {
    body = JSON.parse(body);
    if (body.resultCount == 0) return { iTunesID: id, isDown: true };
    const data = body.results[0];
    const podcast = {
        iTunesID: id,
        isDown: false,
        title: data.collectionName,
        author: data.artistName,
        feedUrl: data.feedUrl,
        releaseDate: data.releaseDate,
        genreIDs: data.genreIds,
        country: data.country,
        trackCount: data.trackCount,
    };
    return podcast;
}

const parsePodcast = (podcast, callback) => {
    const id = podcast.itunesid;
    iTunesTools.lookup(id, (err, response, body) => {
        if (err) return callback(err);
        const podcast = parseResponse(id, body);
        callback(null, podcast);
    })
}

const discoverFeed = (podcast, callback) => {
    if (podcast.isDown) return callback(null, podcast);
    const feedUrl = podcast.feedUrl;
    httpRequest(feedUrl, { method: 'GET' }, (err, response, body) => {
        if (err) {
            podcast.feed = { err };
            return callback(null, podcast);
        }
        const statusCode = response.statusCode;
        podcast.feed = {
            body,
            statusCode
        }
        callback(null, podcast);
    });
}

const extractHostings = (podcast, callback) => {
    if (podcast.isDown) return callback(null, podcast);
    const feed = podcast.feed;
    if (feed.err) return callback(null, podcast);
    const body = feed.body;
    if (body == '') return callback(null, podcast);

    const enclosureRegex = /(<enclosure)[^>]*(type="audio\/[\S]*")[^>]*(<\/enclosure>|[\/]*>|)/g;
    const enclosures = [];
    var match;
    while ((match = enclosureRegex.exec(body)) != null) {
        enclosures.push(match[0]);
    }
    const l = enclosures.length

    const hostings = [];
    const vendors = require('../vendors.json');
    const vendorsKeys = Object.keys(vendors);
    const vl = vendorsKeys.length;
    // iterate through enclosures
    for (var i = 0; i < l; i++) {
        const currEnclosure = enclosures[i];
        var j = 0;
        while (currEnclosure.indexOf(vendorsKeys[j]) == -1 && j < vl) {
            j++;
        }
        hostings.push(vendorsKeys[j] ? vendors[vendorsKeys[j]] : 'UNKNOWN');
    }

    podcast.enclosures = {
        enclosures,
        count: l
    }
    podcast.hostings = {
        hostings,
        count: hostings.length
    }
    return callback(null, podcast);
};

const loadPodcast = (podcast, callback) => {
    if (podcast.isDown) {
        db.query('UPDATE Podcasts SET feeddown = $1 WHERE itunesid = $2;',
            [
                podcast.isDown.toString(),
                podcast.iTunesID
            ],
            (err) => {
                if (err) return callback(err, null);
                return callback(null, true);
            });
    } else if (!podcast.feed.err && podcast.feed.body != '') {
        if ('hostings' in podcast.hostings) {
            db.query('UPDATE Podcasts SET feeddown = $1, title = $2, authorname = $3, feedurl = $4, releasedate = $5, lastupdate = $6, genreids = $7, country = $8, trackcount = $9, hostingvendors = $10 WHERE itunesid = $11;',
                [
                    podcast.isDown.toString(),
                    podcast.title,
                    podcast.author,
                    podcast.feedUrl,
                    podcast.releaseDate,
                    new Date().toISOString(),
                    arrayToPostgres(podcast.genreIDs),
                    podcast.country,
                    podcast.trackCount,
                    arrayToPostgres(podcast.hostings.hostings),
                    podcast.iTunesID
                ],
                (err) => {
                    if (err) return callback(err);
                    return callback(null, true);
                })
        } else {
            return callback(null, true);
        }
    } else {
        return callback(null, true);
    }
}

module.exports = {
    parsePodcast,
    discoverFeed,
    extractHostings,
    loadPodcast
}