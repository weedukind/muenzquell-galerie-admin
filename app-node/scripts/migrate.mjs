import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

function loadEnvLocal() {

    const envPath = path.join(__dirname, "..", ".env.local");

    if (!fs.existsSync(envPath))
        return;

    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {

        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#"))
            continue;

        const eq = trimmed.indexOf("=");

        if (eq === -1)
            continue;

        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();

        if (!(key in process.env))
            process.env[key] = value;
    }
}

async function d1Query(sql, params = []) {

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

    const json = await res.json();

    if (!res.ok || !json.success || !json.result?.[0]?.success) {
        const message = json.errors?.map(e => e.message).join("; ") ?? res.statusText;
        throw new Error(`D1 query failed: ${message}\nSQL: ${sql}`);
    }

    return json.result[0];
}

function splitStatements(sql) {

    return sql
        .split(";")
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
}

async function main() {

    loadEnvLocal();

    await d1Query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename VARCHAR(255) NOT NULL,
            applied_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
            PRIMARY KEY (filename)
        )
    `);

    const { results: appliedRows } = await d1Query("SELECT filename FROM schema_migrations");
    const applied = new Set(appliedRows.map(row => row.filename));

    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(file => file.endsWith(".sql"))
        .sort();

    let didWork = false;

    for (const file of files) {

        if (applied.has(file))
            continue;

        didWork = true;
        console.log(`Applying ${file} ...`);

        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

        for (const statement of splitStatements(sql)) {
            await d1Query(statement);
        }

        await d1Query(
            "INSERT INTO schema_migrations (filename) VALUES (?)",
            [file]
        );
    }

    console.log(didWork ? "Migrations applied." : "Already up to date.");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
