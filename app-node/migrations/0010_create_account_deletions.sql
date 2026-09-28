-- Pending "delete my account" requests from the frontend: the account is only
-- deleted once the link mailed to the user is opened. One request per user,
-- a new one replaces the old.
CREATE TABLE account_deletions (
    user_id INTEGER PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE (token_hash),
    CONSTRAINT fk_account_deletions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
