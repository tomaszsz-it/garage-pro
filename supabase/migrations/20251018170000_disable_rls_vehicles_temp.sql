-- Migration: Temporarily disable RLS for vehicles table
-- Purpose: Allow development without authentication until full auth is implemented
-- WARNING: This is a temporary solution for development only!
-- TODO: Re-enable RLS when authentication is fully implemented

-- Disable Row Level Security for vehicles table
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

-- Add comment to remind about temporary nature
COMMENT ON TABLE vehicles IS 'RLS temporarily disabled for development - TODO: re-enable when auth is implemented';
