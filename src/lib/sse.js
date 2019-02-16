'use strict'

const async = require('async');

const subscribers = [];
var eventId = 0;


module.exports = {
    subscribe: (res) => {
        subscribers.push(res);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write('\n');
    },
    unsubscribe: (res) => {
        const index = subscribers.indexOf(res);
        subscribers.splice(index, 1);
    },
    write: (payload, callback) => {
        console.log(payload);
        async.each(subscribers, (res, callback) => {
            res.write(`id: ${eventId}\n`);
            res.write(`data: ${payload}\n\n`);
            eventId++;
            callback(null, true);
        }, (err) => {
            if (err) return callback(err);
            callback(null);
        });
    }
}