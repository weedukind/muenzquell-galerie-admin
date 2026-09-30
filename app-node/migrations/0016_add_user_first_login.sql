-- When the user logged in for the first time, shown as "Dabei seit" on the
-- frontend's "Mein Konto". Set once by the frontend's login, NULL until then.
ALTER TABLE users ADD COLUMN first_login_at TEXT DEFAULT NULL;

-- Users who logged in before this column existed get the earliest trace of
-- them being logged in: a session, a like, a view or their last login.
-- Sessions are deleted on logout, so this can be later than the real date.
UPDATE users
SET first_login_at = (
    SELECT MIN(t) FROM (
        SELECT last_login_at AS t
        UNION ALL SELECT MIN(created_at) FROM sessions WHERE user_id = users.id
        UNION ALL SELECT MIN(created_at) FROM image_likes WHERE user_id = users.id
        UNION ALL SELECT MIN(first_viewed_at) FROM image_views WHERE user_id = users.id
    )
)
WHERE last_login_at IS NOT NULL
