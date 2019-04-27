import { MongoClient } from "mongodb";
export declare function status(): Promise<any>;
export declare function exec(operation: (client: MongoClient) => Promise<any>): Promise<any>;
