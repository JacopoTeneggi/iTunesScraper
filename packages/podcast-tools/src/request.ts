import { HttpClient, HttpClientResponse } from "typed-rest-client/HttpClient";

let httpc: HttpClient = new HttpClient("itunes-scraper");

export interface GenericHTTPResponse {
    statusCode?: number;
    res?: HttpClientResponse,
    body?: any
}

export async function request(url: string): Promise<GenericHTTPResponse> {
    return new Promise((resolve, reject) => {
        httpc.get(url)
            .then(res => {
                const statusCode = res.message.statusCode;
                res.readBody()
                    .then(value => {
                        try {
                            const body = JSON.parse(value);
                            resolve({ statusCode, res, body });
                        } catch (err) {
                            resolve({ statusCode, res, body: value });
                        }
                    })
                    .catch(reason => { reject(reason); })
            })
            .catch(err => { return reject(err) })
    });
};
