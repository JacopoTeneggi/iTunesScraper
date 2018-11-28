'use strict'

const csv = require('csv');
const fs = require('fs');
const path = require('path');

const readCSV = (filePath, callback) => {
    const resolvedPath = path.join(__dirname, '..', filePath);
    fs.readFile(resolvedPath, (err, data) => {
        if (err) return err;
        csv.parse(data.toString(), (err, output) => {
            if (err) return callback(err);
            return callback(null, output);
        })
    })
}

module.exports = {
    readCSV
};