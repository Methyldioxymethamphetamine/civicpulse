-- ============================================================
-- Add Likely Spam to report_status enum
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'Likely Spam';
