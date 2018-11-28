'use strict'

const { Pool } = require('pg');
const logger = require('../config/winston').logger;

// Git-ignored credentials file
const credentials = require('./credentials.json');

const pool = new Pool(credentials);

module.exports = {
    query: (text, params, callback) => {
        const start = Date.now();
        return pool.query(text, params, (err, res) => {
            const duration = Date.now() - start;
            if (err) logger.error(`Error in \n ${text} \n ${err}`);
            else logger.verbose(`\tExecuted query\n\t${text}\n\tin ${duration / 1000}s\n\tResults count: ${res.rowCount}`);
            callback(err, res);
        });
    }
}