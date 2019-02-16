import { request, GenericHTTPResponse } from "../util/request";

export const ITUNESAPIURL: string = "https://itunes.apple.com";

export interface iTunesLookupResponse extends GenericHTTPResponse {
    body: {
        resultCount: 0 | 1,
        results: any[]
    }
}

export const lookup = async (id: number, entity: string = "podcast"): Promise<iTunesLookupResponse> =>
    request(`${ITUNESAPIURL}/lookup?id=${id}&entity=${entity}`)
        .then(response => response)
        .catch(err => err);