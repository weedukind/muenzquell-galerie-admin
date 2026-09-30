-- SHA-256 of the file's content (hex), so the same file can't be uploaded
-- twice. Set by POST /api/upload, uploads from before this column are filled
-- in by `npm run backfill-hashes`. NULL until then, and for later copies of a
-- file that was already uploaded more than once (the unique index allows
-- any number of NULLs).
ALTER TABLE uploads ADD COLUMN content_hash TEXT DEFAULT NULL;

CREATE UNIQUE INDEX idx_uploads_content_hash ON uploads (content_hash)
