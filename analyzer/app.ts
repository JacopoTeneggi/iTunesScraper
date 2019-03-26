import express from "express";
import bodyParser from "body-parser";

import * as AnalyzerController from "./lib/analyzer"

const app = express();

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());

app.get("/", AnalyzerController.index);

export default app;
