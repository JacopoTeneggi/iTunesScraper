import { GenericHTTPResponse } from "./request";
export declare const ITUNESAPIURL: string;
export interface iTunesLookupResponse extends GenericHTTPResponse {
    body: {
        resultCount: 0 | 1;
        results: any[];
    };
}
export declare function lookup(id: number, entity?: string): Promise<iTunesLookupResponse>;
