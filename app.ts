import express from "express";
import bodyParser from "body-parser";
import path from "path";

import * as HomeController from "./controllers/home";
import * as AnalyzerController from "./controllers/analyzer"

const app = express();

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());

app.get("/", HomeController.index);

app.post("/analyzer", AnalyzerController.start);
app.get("/analyzer/update-stream", AnalyzerController.subscribeClient);
app.get("/analyzer/message", AnalyzerController.sendTestMessage);

export default app;
