import db from "@/lib/db";
import { AttributeOption, AttributeType, AttributeValues } from "@/types/attribute";

export async function getAttributeTypes(): Promise<AttributeType[]> {

    const types = await db.query<Omit<AttributeType, "options">>(
        `SELECT
            id,
            name,
            sort_order AS sortOrder
         FROM attribute_types
         ORDER BY sort_order, name`
    );

    const options = await db.query<AttributeOption>(
        `SELECT
            o.id,
            o.attribute_type_id AS attributeTypeId,
            o.name,
            o.sort_order AS sortOrder,
            COUNT(ua.upload_id) AS usageCount
         FROM attribute_options o
         LEFT JOIN upload_attributes ua
           ON ua.option_id = o.id
         GROUP BY o.id
         ORDER BY o.sort_order, o.name`
    );

    return types.map(type => ({
        ...type,
        options: options.filter(option => option.attributeTypeId === type.id)
    }));
}

export async function createAttributeType(name: string): Promise<number> {

    const result = await db.execute(
        `INSERT INTO attribute_types (name, sort_order)
         VALUES (?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM attribute_types))`,
        [name]
    );

    return result.insertId;
}

export async function updateAttributeType(id: number, name: string): Promise<void> {

    await db.execute(
        `UPDATE attribute_types
         SET name = ?
         WHERE id = ?`,
        [name, id]
    );
}

export async function deleteAttributeType(id: number): Promise<void> {

    await db.execute(
        `DELETE FROM upload_attributes
         WHERE attribute_type_id = ?`,
        [id]
    );

    await db.execute(
        `DELETE FROM attribute_options
         WHERE attribute_type_id = ?`,
        [id]
    );

    await db.execute(
        `DELETE FROM attribute_types
         WHERE id = ?`,
        [id]
    );
}

export async function createAttributeOption(typeId: number, name: string): Promise<number> {

    const result = await db.execute(
        `INSERT INTO attribute_options (attribute_type_id, name, sort_order)
         VALUES (?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM attribute_options WHERE attribute_type_id = ?))`,
        [typeId, name, typeId]
    );

    return result.insertId;
}

export async function updateAttributeOption(id: number, name: string): Promise<void> {

    await db.execute(
        `UPDATE attribute_options
         SET name = ?
         WHERE id = ?`,
        [name, id]
    );
}

// returns false if the option is still assigned to an upload (and was therefore not deleted)
export async function deleteAttributeOption(id: number): Promise<boolean> {

    const result = await db.execute(
        `DELETE FROM attribute_options
         WHERE id = ?
           AND NOT EXISTS (SELECT 1 FROM upload_attributes WHERE option_id = ?)`,
        [id, id]
    );

    return result.changes > 0;
}

function sortOrderStatement(ids: number[]): { cases: string; params: number[] } {

    return {
        cases: ids.map(() => "WHEN ? THEN ?").join(" "),
        params: ids.flatMap((id, index) => [id, index])
    };
}

export async function reorderAttributeTypes(ids: number[]): Promise<void> {

    if (ids.length === 0)
        return;

    const { cases, params } = sortOrderStatement(ids);

    await db.execute(
        `UPDATE attribute_types
         SET sort_order = CASE id ${cases} ELSE sort_order END`,
        params
    );
}

export async function reorderAttributeOptions(typeId: number, ids: number[]): Promise<void> {

    if (ids.length === 0)
        return;

    const { cases, params } = sortOrderStatement(ids);

    await db.execute(
        `UPDATE attribute_options
         SET sort_order = CASE id ${cases} ELSE sort_order END
         WHERE attribute_type_id = ?`,
        [...params, typeId]
    );
}

interface UploadAttributeRow {
    upload_id: number;
    attribute_type_id: number;
    option_id: number;
}

function toValuesMap(rows: UploadAttributeRow[]): Map<number, AttributeValues> {

    const map = new Map<number, AttributeValues>();

    for (const row of rows) {

        if (!map.has(row.upload_id)) {
            map.set(row.upload_id, {});
        }

        map.get(row.upload_id)![row.attribute_type_id] = row.option_id;
    }

    return map;
}

export async function getAttributeValuesForUploads(): Promise<Map<number, AttributeValues>> {

    const rows = await db.query<UploadAttributeRow>(
        `SELECT upload_id, attribute_type_id, option_id
         FROM upload_attributes`
    );

    return toValuesMap(rows);
}

export async function getAttributeValuesForUpload(uploadId: number): Promise<AttributeValues> {

    const rows = await db.query<UploadAttributeRow>(
        `SELECT upload_id, attribute_type_id, option_id
         FROM upload_attributes
         WHERE upload_id = ?`,
        [uploadId]
    );

    return toValuesMap(rows).get(uploadId) ?? {};
}

// values must already be validated against getAttributeTypes() (see validateAttributeValues)
export async function setUploadAttributes(uploadId: number, values: AttributeValues): Promise<void> {

    const entries = Object.entries(values);

    if (entries.length === 0)
        return;

    await db.execute(
        `INSERT INTO upload_attributes (upload_id, attribute_type_id, option_id)
         VALUES ${entries.map(() => "(?, ?, ?)").join(", ")}
         ON CONFLICT (upload_id, attribute_type_id) DO UPDATE SET option_id = excluded.option_id`,
        entries.flatMap(([typeId, optionId]) => [uploadId, Number(typeId), optionId])
    );
}
