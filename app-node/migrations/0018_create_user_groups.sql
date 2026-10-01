-- Groups of frontend users, managed in this backend at /groups. A user can be
-- in any number of groups (user_group_members). Deleting a group or a user
-- removes their memberships. Accounts deleted in the frontend keep theirs,
-- since their row stays (see 0012).
CREATE TABLE user_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL COLLATE NOCASE,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE (name)
);

CREATE TABLE user_group_members (
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    added_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    PRIMARY KEY (group_id, user_id),
    CONSTRAINT fk_group_members_group FOREIGN KEY (group_id) REFERENCES user_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_group_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_group_members_user ON user_group_members (user_id)
