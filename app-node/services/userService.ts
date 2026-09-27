import db from "@/lib/db";
import { UserRecord } from "@/types/user";

interface UserRow extends Omit<UserRecord, "isLocked"> {
    isLocked: number;
}

export async function getUsers(): Promise<UserRecord[]> {

    const rows = await db.query<UserRow>(
        `SELECT
            u.id,
            u.email,
            u.display_name AS displayName,
            u.is_locked AS isLocked,
            u.last_login_at AS lastLoginAt,
            u.invited_by AS invitedById,
            inviter.display_name AS invitedByName,
            u.created_at AS createdAt
         FROM users u
         LEFT JOIN users inviter
           ON inviter.id = u.invited_by
         ORDER BY u.display_name COLLATE NOCASE`
    );

    return rows.map(row => ({
        ...row,
        isLocked: row.isLocked === 1
    }));
}

// returns false if no user with this id exists
export async function setUserLocked(id: number, locked: boolean): Promise<boolean> {

    const result = await db.execute(
        `UPDATE users
         SET is_locked = ?
         WHERE id = ?`,
        [locked ? 1 : 0, id]
    );

    return result.changes > 0;
}
