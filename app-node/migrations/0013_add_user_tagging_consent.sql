-- Tagging people on images is opt-in: only users who agreed on "Mein Konto"
-- can tag others and be tagged. Holds when they agreed, NULL if they haven't
-- (or withdrew it, or deleted their account).
ALTER TABLE users ADD COLUMN tagging_consent_at TEXT DEFAULT NULL
