CREATE TABLE uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    object_key VARCHAR(255) NOT NULL,
    public_url VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) DEFAULT NULL,
    size INTEGER NOT NULL,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
