-- Migration: Temporarily disable RLS for debugging
-- Purpose: Verify that RLS is the cause of 400 errors
-- WARNING: This is temporary for debugging only!

-- Disable RLS temporarily
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE vehicles IS 'RLS temporarily disabled for debugging auth.uid() issue';
COMMENT ON TABLE reservations IS 'RLS temporarily disabled for debugging auth.uid() issue';

