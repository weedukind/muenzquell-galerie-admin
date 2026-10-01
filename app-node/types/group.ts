export interface GroupRecord {
    id: number;
    name: string;
    memberCount: number;
    createdAt: string;
}

// A group as shown next to a user.
export interface GroupRef {
    id: number;
    name: string;
}

export interface GroupMember {
    id: number;
    email: string;
    displayName: string;
    isLocked: boolean;
    // set for accounts deleted in the frontend; email and displayName are placeholders then
    deletedAt: string | null;
    addedAt: string;
}
