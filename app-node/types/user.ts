export interface UserRecord {
    id: number;
    email: string;
    displayName: string;
    isLocked: boolean;
    // null until the user has logged in for the first time, i.e. accepted the invitation
    lastLoginAt: string | null;
    invitedById: number | null;
    invitedByName: string | null;
    // true if the inviter has deleted their account; invitedByName is a placeholder then
    invitedByDeleted: boolean;
    // sessions that haven't expired yet, i.e. the user is logged in on that many browsers
    activeSessionCount: number;
    // start of the most recent of those sessions
    lastSessionStartedAt: string | null;
    createdAt: string;
    // set once the user deleted their account in the frontend; email and displayName are placeholders then
    deletedAt: string | null;
}
