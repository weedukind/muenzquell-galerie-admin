-- Tags were replaced by attributes (0005) and never used: both tables were
-- empty when they were dropped, and the frontend never read them. The
-- frontend's person tags (image_person_tags, 0014) are unrelated.
DROP TABLE upload_tags;

DROP TABLE tags
