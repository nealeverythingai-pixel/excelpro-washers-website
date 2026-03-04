-- Migration: Add source column to lead_requests
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Date: 2026-03-03

ALTER TABLE lead_requests ADD COLUMN IF NOT EXISTS source TEXT DEFAULT NULL;

-- Optional: backfill existing leads as 'website' since they came from the contact form
UPDATE lead_requests SET source = 'website' WHERE source IS NULL;

-- Add an index for fast filtering by source
CREATE INDEX IF NOT EXISTS idx_lead_requests_source ON lead_requests (source);
