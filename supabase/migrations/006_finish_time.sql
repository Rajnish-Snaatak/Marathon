-- Migration 006: finish_time column for race results / bulk CSV upload
-- Stored as text (e.g. "03:42:15") — simplest for the hackathon.

ALTER TABLE participants ADD COLUMN IF NOT EXISTS finish_time TEXT;
