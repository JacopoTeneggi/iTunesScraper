import { Response } from "express";

const subscribers: Response[] = [];
let eventId: number = 0;

export const subscribe = (res: Response) => {
    subscribers.push(res);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
};

export const unsubscribe = (res: Response) => {
    subscribers.splice(subscribers.indexOf(res), 1);
};

export const write = async (payload: string) =>
    await subscribers.map((res: Response) => {
        res.write(`id: ${eventId}\n`);
        res.write(`data: ${payload}\n\n`);
        eventId++;
    });
