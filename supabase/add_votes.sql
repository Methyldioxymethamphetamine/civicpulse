-- ============================================================
-- Add upvote / downvote columns to reports
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE reports ADD COLUMN IF NOT EXISTS upvotes   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS downvotes INTEGER NOT NULL DEFAULT 0;

-- Index for ordering by net votes
CREATE INDEX IF NOT EXISTS idx_reports_votes ON reports ((upvotes - downvotes) DESC);
