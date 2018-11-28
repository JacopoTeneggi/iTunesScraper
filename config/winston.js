'use strict';

const { createLogger, transports, format } = require('winston');
const { combine, timestamp, simple, printf } = format;

const SSETransport = require('./sseTransport');

const logger = createLogger({
    format: combine(
        timestamp(),
        simple(),
        printf(info => { return `[${info.level}] @ ${info.timestamp}:\n${info.message}` })
    ),
    levels: {
        'error': 0,
        'info': 1,
        'web': 2,
        'verbose': 3
    },
    transports: [
        new transports.Console({ level: 'error' }),
        new transports.Console({ level: 'info' }),
        new SSETransport({ level: 'web' }),
        new transports.File({ level: 'verbose', filename: './logs/server.log', maxsize: 5242880, maxFiles: 5, handleExceptions: true })
    ]
});

module.exports = {
    logger
}