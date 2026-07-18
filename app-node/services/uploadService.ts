import db from "@/lib/db";
import { UploadRecord } from "@/types/upload";
import { getTagsForUploads } from "./tagService";

export async function insertUpload(upload: UploadRecord): Promise<number> {

    const result = await db.execute(
        `INSERT INTO uploads
            (name, object_key, public_url, mime_type, size, width, height)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            upload.name,
            upload.objectKey,
            upload.publicUrl,
            upload.mimeType,
            upload.size,
            upload.width ?? null,
            upload.height ?? null
        ]
    );

    return result.insertId;
}

export async function getUploads(): Promise<UploadRecord[]> {

    const rows = await db.query(
        `SELECT
            id,
            name,
            object_key AS objectKey,
            public_url AS publicUrl,
            mime_type AS mimeType,
            size,
            width,
            height,
            created_at
         FROM uploads
         ORDER BY created_at DESC`
    );

    const uploads = rows as UploadRecord[];
    for (const upload of uploads) {

        if (upload.created_at) {

            upload.createdAtFormatted =
                new Intl.DateTimeFormat("de-DE", {
                    dateStyle: "short",
                    timeStyle: "medium",
                    timeZone: "Europe/Berlin",
                }).format(new Date(upload.created_at));

        }

    }

    const tags = await getTagsForUploads();

    for (const upload of uploads) {
        upload.tags = tags.get(upload.id!) ?? [];
    }

    return uploads;
}

export async function getUpload(id: number): Promise<UploadRecord | null> {

    const rows = await db.query(
        `SELECT
            id,
            name,
            object_key AS objectKey,
            public_url AS publicUrl,
            mime_type AS mimeType,
            size,
            width,
            height,
            created_at
         FROM uploads
         WHERE id = ?`,
        [id]
    );

    const uploads = rows as UploadRecord[];

    return uploads.length > 0 ? uploads[0] : null;
}

export async function deleteUpload(id: number): Promise<void> {

    await db.execute(
        `DELETE FROM uploads
         WHERE id = ?`,
        [id]
    );
}