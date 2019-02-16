import { Request, Response } from "express";

import * as SSE from "../lib/sse";

type status = "IDLE" | "RUNNING";
let status: status = "IDLE";

export const start = (req: Request, res: Response) => {
    if (status == "RUNNING") return res.status(200).send("Analyzer already running");
    // Qui parte il ciclo di analisi
    res.status(200).send();
};

export const subscribeClient = (req: Request, res: Response) => {
    SSE.subscribe(res);
    req.on("close", () => {
        SSE.unsubscribe(res);
    });
};

export const sendTestMessage = async () => await SSE.write("Ciao! This is a test message sent by the server!");
