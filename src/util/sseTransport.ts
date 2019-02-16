import Transport, { TransportStreamOptions } from "winston-transport";

import * as SSE from "../lib/sse";

export default class SSETransport extends Transport {
    level: string;
    constructor(readonly opts: TransportStreamOptions) {
        super(opts);
        this.level = opts.level;
    }

    log = async (info: any, next: () => void) => {
        await SSE.write(info.message);
        next();
    }
}

