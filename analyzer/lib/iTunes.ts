import { request, GenericHTTPResponse } from "../util/request";

export const ITUNESAPIURL: string = "https://itunes.apple.com";

export interface iTunesLookupResponse extends GenericHTTPResponse {
    body: {
        resultCount: 0 | 1,
        results: any[]
    }
}

export async function lookup(id: number, entity: string = "podcast"): Promise<iTunesLookupResponse> {
    return request(`${ITUNESAPIURL}/lookup?id=${id}&entity=${entity}`)
        .then(response => response)
        .catch(err => err);
}