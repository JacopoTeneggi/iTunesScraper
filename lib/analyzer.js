'use strict';

const async = require('async');
const uuidv1 = require('uuid/v1');
const fs = require('fs');

const db = require('../db');
const podcastTools = require('./podcastTools');
const logger = require('../config/winston').logger;

const reportTestBatch = (testBatch, callback) => {
    logger.info('Creating test batch report...');
    const len = testBatch.length;
    const batchID = uuidv1();
    const report = {
        batchID,
        len,
        err: {
            count: 0,
            messages: [],
            urls: [],
        },
        empty: {
            count: 0,
            urls: []
        },
        down: {
            count: 0,
            urls: []
        }
    };
    for (var i = 0; i < len; i++) {
        const currPodcast = testBatch[i];
        if (currPodcast.isDown) {
            report.down.count++;
            report.down.urls.push(currPodcast.feedUrl);
        } else {
            const feed = currPodcast.feed;
            const err = feed.err
            if (err) {
                report.err.count++;
                report.err.messages.push(err);
                report.err.urls.push(currPodcast.feedUrl);
            } else {
                const feedBody = feed.body;
                if (feedBody == '') {
                    report.empty.count++;
                    report.empty.urls.push(currPodcast.feedUrl);
                }
            }
        }
    }
    fs.writeFile(`./reports/${batchID}.json`, JSON.stringify(report), (err) => {
        if (err) return callback(`Error writing batch report: ${err}`);
        callback(null, batchID);
    });
}

const analyzeBatch = (batch, callback) => {
    const id = batch.id
    logger.log('web', JSON.stringify({ type: 'progress', text: `Analyzing batch #${batch.id}`, progress: { id: batch.id, type: 'indeterminate' } }));
    async.waterfall([
        (callback) => {
            logger.log('web', JSON.stringify({ type: 'progress', text: `[Batch#${batch.id}] Parsing podcasts`, progress: { id: `lookup-${id}`, type: 'indeterminate' } }));
            async.map(batch.data, podcastTools.parsePodcast, (err, results) => {
                if (err) return callback({ id, err });
                batch.data = results;
                logger.log('web', JSON.stringify({ type: 'completed', completed: { id: `lookup-${id}` } }));
                callback(null, batch);
            })
        },
        (batch, callback) => {
            // const bar = new progress('Discovering feeds [:bar] :percent', { total: batch.length });
            logger.log('web', JSON.stringify({ type: 'progress', text: `[Batch#${batch.id}] Discovering feeds`, progress: { id: `discovery-${id}`, type: 'indeterminate' } }));
            async.map(batch.data, podcastTools.discoverFeed, (err, results) => {
                if (err) return callback({ id, err });
                batch.data = results;
                logger.log('web', JSON.stringify({ type: 'completed', completed: { id: `discovery-${id}` } }));
                callback(null, batch);
            })
        },
        (batch, callback) => {
            logger.log('web', JSON.stringify({ type: 'progress', text: `[Batch#${batch.id}] Extracting vendors`, progress: { id: `hostings-${id}`, type: 'indeterminate' } }));
            async.map(batch.data, podcastTools.extractHostings, (err, results) => {
                if (err) return callback({ id, err });
                batch.data = results;
                logger.log('web', JSON.stringify({ type: 'completed', completed: { id: `hostings-${id}` } }));
                callback(null, batch);
            })
        },
        (batch, callback) => {
            logger.log('web', JSON.stringify({ type: 'progress', text: `[Batch#${batch.id}] Loading podcasts into DB`, progress: { id: `load-${id}`, type: 'indeterminate' } }));
            async.map(batch.data, podcastTools.loadPodcast, (err, results) => {
                if (err) return callback({ id, err });
                logger.log('web', JSON.stringify({ type: 'completed', completed: { id: `load-${id}` } }));
                callback(null, results);
            })
        }
    ], (err) => {
        if (err) return callback(err, null);
        logger.log('web', JSON.stringify({ type: 'completed', completed: { id } }));
        return callback(null);
    })
};

const analyze = () => {
    const startTime = Date.now();
    logger.log('web', JSON.stringify({ type: 'text', text: `Started new analysis cycle @ ${startTime}` }));
    // Getting count of old records
    logger.log('web', 'Counting old records');
    db.query('SELECT COUNT(*) FROM podcasts WHERE lastupdate < current_date - 7 OR lastupdate is null;', [], (err, results) => {
        if (err) return logger.error(err);
        const l = results.rows[0].count;
        const batchl = 100;
        const batchn = Math.ceil(l / batchl);
        const batches = [];
        logger.log('web', JSON.stringify({ type: 'text', text: `Found ${l} records to update` }));
        for (var i = 0; i < batchn; i++) {
            const query = `SELECT iTunesID FROM podcasts WHERE lastupdate < current_date - 7 OR lastupdate is null LIMIT ${batchl} OFFSET ${i};`;
            const batch = {
                id: i,
                query
            };
            batches.push(batch);
        };

        async.waterfall([
            (callback) => {
                logger.log('web', JSON.stringify({ type: 'progress', text: `Extracting ${batchn} batches`, progress: { id: 'extracting-batches', type: 'indeterminate' } }));
                async.map(batches, (batch, callback) => {
                    const id = batch.id;
                    db.query(batch.query, [], (err, results) => {
                        if (err) return callback({ id, err });
                        const data = results.rows;
                        batch.data = data;
                        callback(null, batch);
                    });
                }, (err, batches) => {
                    if (err) return callback(err);
                    logger.log('web', JSON.stringify({ type: 'completed', completed: { id: 'extracting-batches' } }));
                    callback(null, batches);
                });
            },
            (batches, callback) => {
                async.eachLimit(batches, 1, analyzeBatch, (err) => {
                    if (err) return callback(err);
                    callback(null);
                })
            }
        ], (err) => {
            if (err) return logger.error(`Error in batch ${err.id}: ${err.err}`);
        })

    });
    return { statusCode: 200, text: 'Analysis cycle started' };
}

module.exports = {
    analyzeBatch,
    analyze
}
