-- Deleting an account in the frontend doesn't remove the row: invited_by
-- must keep showing who recommended whom. Instead the user is disabled
-- (deleted_at set), their e-mail address and display name are overwritten
-- with placeholders, and their likes, sessions and login codes are deleted.
-- NULL for every active user.
ALTER TABLE users ADD COLUMN deleted_at TEXT DEFAULT NULL
