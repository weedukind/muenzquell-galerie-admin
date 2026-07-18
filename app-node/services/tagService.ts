import db from "@/lib/db";
import { TagRecord } from "@/types/tag";

function hashString(value: string): number {

    let hash = 0;

    for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }

    return hash;
}

function hslToHex(h: number, s: number, l: number): string {

    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, "0");

    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function colorFromName(name: string): string {

    const hue = Math.abs(hashString(name)) % 360;

    return hslToHex(hue, 65, 50);
}

export async function getTags(): Promise<TagRecord[]> {

    const rows = await db.query(
        `SELECT
            id,
            name,
            color
         FROM tags
         ORDER BY name`
    );

    return rows as TagRecord[];
}

export async function getTagByName(name: string): Promise<TagRecord | null> {

    const rows = await db.query(
        `SELECT
            id,
            name,
            color
         FROM tags
         WHERE name = ?`,
        [name]
    );

    const tags = rows as TagRecord[];

    return tags.length > 0 ? tags[0] : null;
}

export async function createTag(
    name: string,
    color?: string
): Promise<TagRecord> {

    const finalColor = color ?? colorFromName(name);

    const result = await db.execute(
        `INSERT INTO tags (name, color)
         VALUES (?, ?)`,
        [name, finalColor]
    );

    return {
        id: result.insertId,
        name,
        color: finalColor
    };
}

interface UploadTagRow {
    upload_id: number;
    id: number;
    name: string;
    color: string;
}

export async function getTagsForUploads(): Promise<Map<number, TagRecord[]>> {

    const rows = await db.query(
        `SELECT
            ut.upload_id,
            t.id,
            t.name,
            t.color
         FROM upload_tags ut
         JOIN tags t
           ON t.id = ut.tag_id
         ORDER BY t.name`
    );

    const map = new Map<number, TagRecord[]>();

    for (const row of rows as UploadTagRow[]) {

        if (!map.has(row.upload_id)) {
            map.set(row.upload_id, []);
        }

        map.get(row.upload_id)!.push({
            id: row.id,
            name: row.name,
            color: row.color
        });
    }

    return map;
}

export async function assignTag(
    uploadId: number,
    tagId: number
): Promise<void> {

    await db.execute(
        `INSERT OR IGNORE INTO upload_tags
            (upload_id, tag_id)
         VALUES (?, ?)`,
        [uploadId, tagId]
    );
}

export async function removeTag(
    uploadId: number,
    tagId: number
): Promise<void> {

    await db.execute(
        `DELETE FROM upload_tags
         WHERE upload_id = ?
           AND tag_id = ?`,
        [uploadId, tagId]
    );
}

export async function getTagIdsForUpload(uploadId: number): Promise<number[]> {

    const rows = await db.query<{ tag_id: number }>(
        `SELECT tag_id
         FROM upload_tags
         WHERE upload_id = ?`,
        [uploadId]
    );

    return rows.map(row => row.tag_id);
}

export async function deleteTagIfOrphaned(tagId: number): Promise<void> {

    const rows = await db.query<{ count: number }>(
        `SELECT COUNT(*) AS count
         FROM upload_tags
         WHERE tag_id = ?`,
        [tagId]
    );

    if (rows[0].count === 0) {
        await db.execute(`DELETE FROM tags WHERE id = ?`, [tagId]);
    }
}

export async function getTagsWithUsageCounts(): Promise<TagRecord[]> {

    const rows = await db.query(
        `SELECT
            t.id,
            t.name,
            t.color,
            COUNT(ut.upload_id) AS usageCount
         FROM tags t
         LEFT JOIN upload_tags ut
           ON ut.tag_id = t.id
         GROUP BY t.id
         ORDER BY t.name`
    );

    return rows as TagRecord[];
}

export async function updateTag(
    id: number,
    name: string,
    color: string
): Promise<void> {

    await db.execute(
        `UPDATE tags
         SET name = ?, color = ?
         WHERE id = ?`,
        [name, color, id]
    );
}

export async function deleteTag(id: number): Promise<void> {

    await db.execute(
        `DELETE FROM upload_tags
         WHERE tag_id = ?`,
        [id]
    );

    await db.execute(
        `DELETE FROM tags
         WHERE id = ?`,
        [id]
    );
}