export interface UserRecord {
    id: number;
    email: string;
    displayName: string;
    isLocked: boolean;
    // null until the user has logged in for the first time, i.e. accepted the invitation
    lastLoginAt: string | null;
    invitedById: number | null;
    invitedByName: string | null;
    createdAt: string;
}
