-- Migration 005: enable Supabase Realtime on the participants table
-- so the public /status page receives live postgres UPDATE events.
--
-- Run once. If the table is already in the publication this will error
-- ("table is already member") — that's harmless, it's already enabled.
-- The /status page also polls every 5s as a fallback, so the live tracker
-- works even if this step is skipped.

ALTER PUBLICATION supabase_realtime ADD TABLE participants;
