'use strict'

const httpRequest = require('./utils').httpRequest;

const ITUNESAPIURL = 'https://itunes.apple.com/';

const lookup = (id, callback) => {
    const entity = 'podcast';
    const url = `${ITUNESAPIURL}/lookup?id=${id}&entity=${entity}`;
    httpRequest(url, { method: 'GET' }, (err, response, body) => {
        if (err) return callback(err);
        callback(null, response, body);
    });
}

const search = () => {

}

const top = () => {

}

module.exports = {
    lookup,
    search,
    top
}