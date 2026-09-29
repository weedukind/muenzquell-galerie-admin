-- How often each image was opened in the frontend's lightbox, by logged-in
-- users only and at most once per user and image: one row per pair, holding
-- the first time. The count for an image is its number of rows. Rows stay
-- when an account is deleted (the user row stays too, anonymised), so
-- counts don't drop.
CREATE TABLE image_views (
    upload_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    first_viewed_at TEXT DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%SZ', 'now')),
    PRIMARY KEY (upload_id, user_id),
    CONSTRAINT fk_image_views_upload FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE CASCADE,
    CONSTRAINT fk_image_views_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)
