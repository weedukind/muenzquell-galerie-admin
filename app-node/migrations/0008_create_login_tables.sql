CREATE TABLE login_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code_hash VARCHAR(64) NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    CONSTRAINT fk_login_codes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_login_codes_user ON login_codes (user_id);
CREATE TABLE sessions (
    token_hash VARCHAR(64) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_sessions_user ON sessions (user_id);
