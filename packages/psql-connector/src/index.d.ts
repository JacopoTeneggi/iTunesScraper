import { QueryResult } from "pg";
export declare function query(text: string, params?: any[]): Promise<QueryResult>;
export declare function status(): Promise<any>;
