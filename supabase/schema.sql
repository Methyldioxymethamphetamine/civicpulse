-- ============================================================
-- CivicPulse Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the status enum
CREATE TYPE report_status AS ENUM ('Pending', 'In-Progress', 'Resolved', 'Rejected');

-- 2. Core reports table
CREATE TABLE IF NOT EXISTS reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  description   TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'Other',
  image_url     TEXT,
  fix_image_url TEXT,
  status        report_status NOT NULL DEFAULT 'Pending',
  lat           DECIMAL(10, 7) NOT NULL,
  long          DECIMAL(10, 7) NOT NULL,
  worker_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_note    TEXT
);

-- 3. Enable Row-Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Anyone (anon or authenticated) can INSERT new reports
CREATE POLICY "public_can_insert_reports"
  ON reports FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "anon_can_view_reports"
  ON reports FOR SELECT
  TO anon
  USING (true);

-- Authenticated users (workers/admins) can SELECT all
CREATE POLICY "auth_can_view_reports"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

-- Workers: can UPDATE only their own assigned rows (no DELETE permission)
-- Allow workers to update any report
CREATE POLICY "worker_can_update_reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admins: granted via service_role (bypasses RLS), or use custom JWT claim:
-- CREATE POLICY "admin_full_access"
--   ON reports FOR ALL
--   TO authenticated
--   USING ((auth.jwt() ->> 'role') = 'admin');

-- 5. Storage buckes and policies
INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('fix-images', 'fix-images', true) ON CONFLICT DO NOTHING;

-- Storage RLS: Allow anonymous public to upload report images
CREATE POLICY "Allow public uploads to report-images"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'report-images');

-- Storage RLS: Allow only authenticated workers to upload fix images
CREATE POLICY "Allow auth uploads to fix-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'fix-images');

-- Storage RLS: Allow public viewing of all uploaded items
CREATE POLICY "Allow public viewing of images"
ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('report-images', 'fix-images'));
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_worker_id ON reports(worker_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_location ON reports(lat, long);
