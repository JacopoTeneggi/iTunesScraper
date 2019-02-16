import { Pool, PoolConfig, QueryResult } from "pg";

import credentials from "../../credentials.json";

const pool: Pool = new Pool(<PoolConfig>credentials);

export const query = async (text: string, params: any[] = []): Promise<QueryResult> =>
    pool.query(text, params)
        .then(results => results)
        .catch(err => err)