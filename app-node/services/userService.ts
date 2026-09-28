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
            u.created_at AS createdAt,
            COUNT(s.token_hash) AS activeSessionCount,
            MAX(s.created_at) AS lastSessionStartedAt
         FROM users u
         LEFT JOIN users inviter
           ON inviter.id = u.invited_by
         LEFT JOIN sessions s
           ON s.user_id = u.id
          AND s.expires_at > STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')
         GROUP BY u.id
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

    // The frontend already ignores sessions of locked users, but without this
    // unlocking would bring their old sessions back to life.
    if (locked && result.changes > 0) {
        await deleteUserSessions(id);
    }

    return result.changes > 0;
}

// Logs the user out everywhere: the frontend looks up the session on every
// request, so a deleted session ends it immediately. Returns how many were deleted.
export async function deleteUserSessions(id: number): Promise<number> {

    const result = await db.execute(
        `DELETE FROM sessions
         WHERE user_id = ?`,
        [id]
    );

    return result.changes;
}
