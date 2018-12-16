'use strict'

const { Pool } = require('pg');
const async = require('async');

const logger = require('../config/winston').logger;

// Git-ignored credentials file
const credentials = require('./credentials.json');

const pool = new Pool(credentials);

const query = (text, params, callback) => {
    const start = Date.now();
    return pool.query(text, params, (err, res) => {
        const duration = Date.now() - start;
        if (err) logger.error(`Error in \n ${text} \n ${err}`);
        else logger.verbose(`\tExecuted query\n\t${text}\n\tin ${duration / 1000}s\n\tResults count: ${res.rowCount}`);
        callback(err, res);
    });
}

const batchQuery = (queries, callback) => {
    async.mapValues(queries, (text, key, callback) => {
        query(text, [], (err, res) => {
            if (err) return callback(err);
            callback(null, res.rows);
        })
    }, (err, results) => {
        if (err) return callback(err);
        return callback(null, results);
    });
}

module.exports = {
    query,
    batchQuery
}