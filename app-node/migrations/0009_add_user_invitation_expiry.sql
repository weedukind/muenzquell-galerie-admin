-- Invitations from the frontend expire: until the invited user logs in for the
-- first time, they can only log in before this timestamp. Cleared on the first
-- login. NULL for everyone else (including users created before this column).
ALTER TABLE users ADD COLUMN invitation_expires_at TEXT DEFAULT NULL
