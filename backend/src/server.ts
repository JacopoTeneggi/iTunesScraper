import app from "./app";


const server = app.listen(app.get("port"), () => {
    console.log("Server is listening on port");
});

export default server;