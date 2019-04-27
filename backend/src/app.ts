import express, { Response, Request } from "express";
import bodyParser from "body-parser";
import cors from "cors";

import * as mongo from "../../lib/mongo-connector/index";
import * as psql from "../../lib/psql-connector/index";
import { MongoClient, AggregationCursor } from "mongodb";

const app = express();

app.use(cors());

app.set("port", process.env.PORT || 3003);
app.use(bodyParser.json());

app.get("/", (_: Request, res: Response) => {
    res.status(200).send();
});

app.get("/stats", (_: Request, res: Response) => {
    const stats: { [key: string]: string } = {
        count: "SELECT COUNT(*) FROM podcasts;",
        downCount: "SELECT COUNT(*) FROM podcasts WHERE feeddown IS TRUE;",
        analyzed: "SELECT COUNT(*) FROM podcasts WHERE feeddown IS NOT NULL;"
    };
    return Promise.all(
        Object.keys(stats)
            .map(key => psql.query(stats[key])
                .then(results => [key, results.rows])
                .catch(reason => [key, reason])
            )
    )
        .then(results => res.status(200).send(results.reduce((acc, el) => ({ ...acc, [el[0]]: el[1] }), {})))
        .catch(reason => res.status(500).send(reason))
});

app.get("/topten", (_: Request, res: Response) => {
    psql.query('SELECT hostingvendors, COUNT(*) from ( select unnest(hostingvendors) as hostingvendors FROM podcasts WHERE feeddown = FALSE ) as hostingvendors group by hostingvendors order by count desc LIMIT 10;', [])
        .then(results => { console.log(results); res.status(200).send(results.rows) })
        .catch(reason => { res.status(500).send(reason); })
});

app.get("/runs", (_: Request, res: Response) => {
    mongo.exec((client: MongoClient) => new Promise((resolve, reject) => {
        client.db("podcasts").collection("run-data").aggregate(
            [
                {
                    "$group": {
                        _id: {
                            _runId: "$runID",
                            _batchId: "$batchID"
                        },
                        records: {
                            $push: {
                                title: "$title",
                                author: "$author",
                                feedUrl: "$feedUrl",
                                steps: "$steps",
                                itunesid: "$itunesid",
                                isDown: "$isDown"
                            }
                        }
                    }
                },
                {
                    "$group": {
                        _id: "$_id._runId",
                        batches: {
                            $push: {
                                _batchId: "$_id._batchId",
                                records: "$records"
                            }
                        }
                    }
                }], (err, cursor: AggregationCursor<any>) => {
                    if (err) reject(err);
                    resolve(cursor.toArray());
                })
    }))
        .then(documents => { res.status(200).send(documents) })
        .catch(reason => { res.status(500).send(reason) })
});

export default app;