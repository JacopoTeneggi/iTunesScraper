import { Pool, PoolConfig, QueryResult } from "pg";

const credentials = {
    "user": process.env.POSTGRES_USER || "podcasts",
    "host": process.env.POSTGRES_DB_HOST || "localhost",
    "database": "podcasts",
    "password": process.env.POSTGRES_PASSWORD || "1234"
}

const pool: Pool = new Pool(<PoolConfig>credentials);

export async function query(text: string, params: any[] = []): Promise<QueryResult> {
    return pool.query(text, params)
        .then(results => results)
        .catch(err => err)
};

export async function status() {
    return query("SELECT NOW();")
        .then(_ => true)
        .catch(reason => reason)
}
