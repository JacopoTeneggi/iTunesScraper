import { MongoClient } from "mongodb";
export declare function status(): any;
export declare function exec(operation: (client: MongoClient) => Promise<any>): Promise<{}>;
