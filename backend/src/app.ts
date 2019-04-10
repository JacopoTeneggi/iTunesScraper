import express, { Response, Request } from "express";
import bodyParser from "body-parser";

import * as mongo from "./util/mongo";
import { MongoClient } from "mongodb";

const app = express();

app.set("port", process.env.PORT || 3003);
app.use(bodyParser.json());

app.get("/", (_: Request, res: Response) => {
    res.status(200).send();
});

app.get("/records", (_: Request, res: Response) => {
    mongo.exec((client: MongoClient) => new Promise((resolve, reject) => {
        client.db("podcasts").collection("run-data").aggregate([{
            "$group": {
                _id: "$runID",
                record: {
                    $push: {
                        title: "$title",
                        author: "$author",
                        feedUrl: "$feedUrl",
                        steps: "$steps",
                        itunesid: "$itunesid"
                    }
                }
            }
        }], (err, cursor) => {
            if (err) reject(err);
            resolve(cursor.toArray());
        })
    }))
        .then(documents => { console.log("OK"); res.status(200).send(documents) })
        .catch(reason => { console.log("ERROR"); res.status(200).send(reason) })
})

export default app;