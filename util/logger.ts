import * as winston from "winston";
import { TransportStreamOptions } from "winston-transport";
import SSETransport from "./sseTransport";

export const logger = winston.createLogger({
    levels: {
        "error": 0,
        "info": 1,
        "web": 2,
        "verbose": 3
    },
    transports: [
        new winston.transports.Console({ level: "error" }),
        new winston.transports.Console({ level: "info" }),
        new SSETransport({ level: "web" }),
        new winston.transports.File({ level: 'verbose', filename: './logs/server.log', maxsize: 5242880, maxFiles: 5, handleExceptions: true })
    ]
});

export default logger;

