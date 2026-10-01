-- The gallery shows users who don't take part in tagging people a one-time
-- hint after logging in, on how to join (pick a recognisable display name,
-- consent on "Mein Konto"). Holds when they dismissed it, NULL until then.
ALTER TABLE users ADD COLUMN tagging_hint_seen_at TEXT DEFAULT NULL
