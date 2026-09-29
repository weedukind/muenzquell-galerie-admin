import db from "@/lib/db";
import { TaggedPerson } from "@/types/person";

// upload id -> the people tagged on it, by name. Tags are set in the frontend;
// deleted accounts and withdrawn consent remove them there.
export async function getPeopleForUploads(): Promise<Map<number, TaggedPerson[]>> {

    const rows = await db.query<TaggedPerson & { uploadId: number }>(
        `SELECT
            t.upload_id AS uploadId,
            u.id,
            u.display_name AS name
         FROM image_person_tags t
         JOIN users u
           ON u.id = t.user_id
         ORDER BY u.display_name COLLATE NOCASE`
    );

    const people = new Map<number, TaggedPerson[]>();

    for (const { uploadId, ...person } of rows) {
        people.set(uploadId, [...(people.get(uploadId) ?? []), person]);
    }

    return people;
}
