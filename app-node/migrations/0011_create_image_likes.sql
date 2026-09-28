-- Images liked by users of the frontend. One row per user and image, the
-- frontend marks liked images with a heart for that user.
CREATE TABLE image_likes (
    user_id INTEGER NOT NULL,
    upload_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    PRIMARY KEY (user_id, upload_id),
    CONSTRAINT fk_image_likes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_image_likes_upload FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE CASCADE
);

CREATE INDEX idx_image_likes_upload ON image_likes (upload_id)
