// Fills in uploads.content_hash (migration 0017) for uploads from before it
// existed: downloads each file from R2 and stores the SHA-256 of its content.
//
// If the same content was uploaded more than once, only the oldest upload
// gets the hash (the column is unique); the later copies keep NULL and are
// listed at the end, so they can be checked and deleted by hand if wanted.
//
//   npm run backfill-hashes              write the hashes
//   npm run backfill-hashes -- --dry-run only report what would be written
//
// Like scripts/migrate.mjs a standalone script: reads .env.local itself and
// talks to D1 over its HTTP API. Can be run again at any time; it only looks
// at uploads without a hash.
import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

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

    return json.result[0].results;
}

async function hashObject(r2, objectKey) {

    const { Body } = await r2.send(new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: objectKey
    }));

    const hash = createHash("sha256");

    for await (const chunk of Body)
        hash.update(chunk);

    return hash.digest("hex");
}

async function main() {

    loadEnvLocal();

    const columns = await d1Query("SELECT name FROM pragma_table_info('uploads')");
    const hasColumn = columns.some(column => column.name === "content_hash");

    if (!hasColumn && !DRY_RUN)
        throw new Error("uploads.content_hash is missing: run `npm run migrate` first.");

    const r2 = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
        }
    });

    // hash -> the upload that has (or, in a dry run, would get) it
    const owners = new Map();

    if (hasColumn) {
        for (const row of await d1Query("SELECT id, name, content_hash FROM uploads WHERE content_hash IS NOT NULL"))
            owners.set(row.content_hash, row);
    }

    // oldest first, so the original keeps the hash rather than a later copy
    const uploads = await d1Query(
        `SELECT id, name, object_key
         FROM uploads
         ${hasColumn ? "WHERE content_hash IS NULL" : ""}
         ORDER BY id`
    );

    console.log(`${uploads.length} upload(s) without a hash${DRY_RUN ? " (dry run, nothing is written)" : ""}.`);

    const duplicates = [];
    const failures = [];
    let written = 0;

    for (const upload of uploads) {

        let contentHash;

        try {
            contentHash = await hashObject(r2, upload.object_key);
        } catch (err) {
            failures.push({ upload, reason: err.message });
            continue;
        }

        const owner = owners.get(contentHash);

        if (owner) {
            duplicates.push({ upload, owner });
            continue;
        }

        owners.set(contentHash, upload);

        if (!DRY_RUN) {
            await d1Query("UPDATE uploads SET content_hash = ? WHERE id = ?", [contentHash, upload.id]);
        }

        written++;
    }

    console.log(`${DRY_RUN ? "Would set" : "Set"} the hash of ${written} upload(s).`);

    if (duplicates.length > 0) {
        console.log(`\n${duplicates.length} copy/copies of an upload that already exists (left without a hash):`);
        for (const { upload, owner } of duplicates)
            console.log(`  ID ${upload.id} "${upload.name}" = ID ${owner.id} "${owner.name}"`);
    }

    if (failures.length > 0) {
        console.log(`\n${failures.length} upload(s) could not be read from R2:`);
        for (const { upload, reason } of failures)
            console.log(`  ID ${upload.id} "${upload.name}": ${reason}`);
        process.exitCode = 1;
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
