'use strict'

const http = require('follow-redirects').http;

const httpRequest = (url, options, callback) => {
    var called = false;
    // regex groups
    // 0: whole match
    // 1: protocol (with :// )
    // 2: protocol (without ://)
    // 3: hostname
    // 4: path
    const urlRegex = /^((http[s]?):\/\/)([^:\/\s]+)(.*)$/g;
    const match = urlRegex.exec(url);

    if (!match) return callback(`No url found ${url}`);

    options['hostname'] = match[3];
    options['path'] = match[4];
    options['port'] = null;

    const req = http.request(options, (res) => {
        const chunks = [];

        res.on('data', (chunk) => {
            chunks.push(chunk);
        });
        res.on('end', () => {
            const body = Buffer.concat(chunks).toString();
            if (!called) return callback(null, res, body);
            return
        })
    });

    req.on('socket', (socket) => {
        socket.setTimeout(5000);
        socket.on('timeout', () => {
            req.abort();
        })
    })

    req.on('error', (e) => {
        called = true;
        return callback(e);
    });

    req.end();
};

const arrayToPostgres = (val) => {
    var string = '{ ';
    const l = val.length;
    var i = 0;
    for (i; i < (l - 1); i++) {
        const el = val[i];
        string += el + ' , ';
    }
    string += val[i] + ' }';
    return string;
}

module.exports = {
    httpRequest,
    arrayToPostgres
}