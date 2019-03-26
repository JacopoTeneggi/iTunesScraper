import app from "./app";
import * as AnalyzerController from "./lib/analyzer";


const server = app.listen(app.get("port"), () => {
    console.log("START");
    AnalyzerController.analyze()
        .then(_ => server.close())
        .catch(_ => server.close());
});

export default server;