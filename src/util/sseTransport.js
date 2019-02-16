'use strict'

const Transport = require('winston-transport');
const sse = require('../lib/sse');

module.exports = class SSETransport extends Transport {
    constructor(opts) {
        super (opts);
        this.level = opts.level;
    }

    log(info, callback) {
        console.log(info);
        setImmediate(() => {
            this.emit('logged', info);
        });
        sse.write(info.message, callback);
    }
}