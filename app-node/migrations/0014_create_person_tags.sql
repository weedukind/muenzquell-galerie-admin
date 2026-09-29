-- People tagged on images in the frontend. Only users who consented
-- (users.tagging_consent_at) can tag and be tagged. A person is tagged at
-- most once per image. tagged_by is who set the tag, and they or the tagged
-- person can remove it. Withdrawing consent or deleting the account removes
-- the person's tags, while tags they set on others stay.
CREATE TABLE image_person_tags (
    upload_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    tagged_by INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    PRIMARY KEY (upload_id, user_id),
    CONSTRAINT fk_person_tags_upload FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE CASCADE,
    CONSTRAINT fk_person_tags_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_person_tags_tagged_by FOREIGN KEY (tagged_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX idx_person_tags_user ON image_person_tags (user_id);

-- A person who removed themselves from an image can't be tagged on it again,
-- by anyone. A tagger taking back their tag doesn't block.
CREATE TABLE image_person_untags (
    upload_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    untagged_by INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    PRIMARY KEY (upload_id, user_id),
    CONSTRAINT fk_person_untags_upload FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE CASCADE,
    CONSTRAINT fk_person_untags_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_person_untags_untagged_by FOREIGN KEY (untagged_by) REFERENCES users (id) ON DELETE SET NULL
)
