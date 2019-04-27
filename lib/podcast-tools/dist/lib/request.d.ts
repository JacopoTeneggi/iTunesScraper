import { HttpClientResponse } from "typed-rest-client/HttpClient";
export interface GenericHTTPResponse {
    statusCode?: number;
    res?: HttpClientResponse;
    body?: any;
}
export declare function request(url: string): Promise<GenericHTTPResponse>;
