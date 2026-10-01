import db from "@/lib/db";
import { GroupMember, GroupRecord, GroupRef } from "@/types/group";

export async function getGroups(): Promise<GroupRecord[]> {

    return db.query<GroupRecord>(
        `SELECT
            g.id,
            g.name,
            g.created_at AS createdAt,
            COUNT(m.user_id) AS memberCount
         FROM user_groups g
         LEFT JOIN user_group_members m
           ON m.group_id = g.id
         GROUP BY g.id
         ORDER BY g.name COLLATE NOCASE`
    );
}

export async function getGroup(id: number): Promise<GroupRecord | null> {

    const groups = await db.query<GroupRecord>(
        `SELECT
            g.id,
            g.name,
            g.created_at AS createdAt,
            (SELECT COUNT(*) FROM user_group_members m WHERE m.group_id = g.id) AS memberCount
         FROM user_groups g
         WHERE g.id = ?`,
        [id]
    );

    return groups[0] ?? null;
}

// Names are unique regardless of case; a clash throws "UNIQUE constraint failed".
export async function createGroup(name: string): Promise<number> {

    const result = await db.execute(
        `INSERT INTO user_groups (name)
         VALUES (?)`,
        [name]
    );

    return result.insertId;
}

// returns false if no group with this id exists
export async function renameGroup(id: number, name: string): Promise<boolean> {

    const result = await db.execute(
        `UPDATE user_groups
         SET name = ?
         WHERE id = ?`,
        [name, id]
    );

    return result.changes > 0;
}

// The memberships go with it (ON DELETE CASCADE).
export async function deleteGroup(id: number): Promise<void> {

    await db.execute(
        `DELETE FROM user_groups
         WHERE id = ?`,
        [id]
    );
}

export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {

    const rows = await db.query<Omit<GroupMember, "isLocked"> & { isLocked: number }>(
        `SELECT
            u.id,
            u.email,
            u.display_name AS displayName,
            u.is_locked AS isLocked,
            u.deleted_at AS deletedAt,
            m.added_at AS addedAt
         FROM user_group_members m
         JOIN users u
           ON u.id = m.user_id
         WHERE m.group_id = ?
         ORDER BY u.deleted_at IS NOT NULL, u.display_name COLLATE NOCASE`,
        [groupId]
    );

    return rows.map(row => ({
        ...row,
        isLocked: row.isLocked === 1
    }));
}

// Adding someone who is already a member changes nothing.
export async function addGroupMember(groupId: number, userId: number): Promise<void> {

    await db.execute(
        `INSERT OR IGNORE INTO user_group_members (group_id, user_id)
         VALUES (?, ?)`,
        [groupId, userId]
    );
}

export async function removeGroupMember(groupId: number, userId: number): Promise<void> {

    await db.execute(
        `DELETE FROM user_group_members
         WHERE group_id = ? AND user_id = ?`,
        [groupId, userId]
    );
}

// user id -> the groups they are in, by name
export async function getGroupsForUsers(): Promise<Map<number, GroupRef[]>> {

    const rows = await db.query<GroupRef & { userId: number }>(
        `SELECT
            m.user_id AS userId,
            g.id,
            g.name
         FROM user_group_members m
         JOIN user_groups g
           ON g.id = m.group_id
         ORDER BY g.name COLLATE NOCASE`
    );

    const groups = new Map<number, GroupRef[]>();

    for (const { userId, ...group } of rows) {
        groups.set(userId, [...(groups.get(userId) ?? []), group]);
    }

    return groups;
}
