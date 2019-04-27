import app from "./app";
import * as AnalyzerController from "./lib/analyzer";

const server = app.listen(app.get("port"), () => {
    console.log("START");
    AnalyzerController.analyze()
        .then(_ => { console.log("STOP"); return server.close(); })
        .catch(reason => { console.log(reason); console.log("STOP"); return server.close(); });
});

export default server;