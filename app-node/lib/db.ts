interface D1Meta {
    last_row_id: number;
    changes: number;
}

interface D1QueryResponse<T> {
    success: boolean;
    result?: Array<{
        results: T[];
        success: boolean;
        meta: D1Meta;
    }>;
    errors?: Array<{ code: number; message: string }>;
}

async function d1Query<T = unknown>(sql: string, params: unknown[] = []) {

    const accountId = process.env.R2_ACCOUNT_ID;
    const databaseId = process.env.D1_DATABASE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sql, params })
        }
    );

    const json: D1QueryResponse<T> = await res.json();

    if (!res.ok || !json.success || !json.result?.[0]?.success) {
        const message = json.errors?.map(e => e.message).join("; ") ?? res.statusText;
        throw new Error(`D1 query failed: ${message}`);
    }

    return json.result[0];
}

const db = {
    async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
        const result = await d1Query<T>(sql, params);
        return result.results;
    },

    async execute(sql: string, params: unknown[] = []): Promise<{ insertId: number; changes: number }> {
        const result = await d1Query(sql, params);
        return {
            insertId: result.meta.last_row_id,
            changes: result.meta.changes
        };
    }
};

export default db;
