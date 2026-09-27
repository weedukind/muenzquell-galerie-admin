CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL COLLATE NOCASE,
    display_name VARCHAR(100) NOT NULL,
    is_locked INTEGER NOT NULL DEFAULT 0 CHECK (is_locked IN (0, 1)),
    last_login_at TEXT DEFAULT NULL,
    invited_by INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE (email),
    CONSTRAINT fk_users_invited_by FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE SET NULL
);
