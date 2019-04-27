interface Enclosure {
    enclosure: string;
    vendor: string;
}
interface Step {
    name: string;
    status: string;
    endTime: number;
    error?: string;
}
export declare class PodcastFeed {
    readonly statusCode: number;
    readonly body: string;
    constructor(statusCode?: number, body?: string);
}
export interface StateConfig {
    iTunesID?: number;
    isDown?: boolean;
    title?: string;
    author?: string;
    feedUrl?: string;
    releaseDate?: string;
    genreIDs?: number[];
    country?: string;
    trackCount?: number;
    feed?: PodcastFeed;
    enclosures?: Enclosure[];
    success?: boolean;
    steps?: Step[];
}
export declare class State {
    iTunesID: number;
    isDown: boolean;
    title: string;
    author: string;
    feedUrl: string;
    releaseDate: string;
    genreIDs: number[];
    country: string;
    trackCount: number;
    feed: PodcastFeed;
    enclosures: Enclosure[];
    success: boolean;
    steps: Step[];
    constructor(stateConfig: StateConfig);
}
export declare function init(state: State): Promise<State>;
export declare function extractHostings(state: State): Promise<State>;
export declare function loadPodcast(state: State): Promise<State>;
export declare const update: (iTunesID: number) => Promise<State>;
export declare function matchVendor(target: string, keys: string[], vendors: any): string;
export {};
