import { Pool, PoolConfig, QueryResult } from "pg";

const credentials = {
    "user": process.env.POSTGRES_USER,
    "host": process.env.POSTGRES_DB_HOST || "localhost",
    "database": process.env.POSTGRES_DB_NAME,
    "password": process.env.POSTGRES_PASSWORD
}

const pool: Pool = new Pool(<PoolConfig>credentials);

export async function query(text: string, params: any[] = []): Promise<QueryResult> {
    return pool.query(text, params)
        .then(results => results)
        .catch(reason => reason)
};

export async function status() {
    return query("SELECT NOW();")
        .then(_ => true)
        .catch(reason => reason)
};
