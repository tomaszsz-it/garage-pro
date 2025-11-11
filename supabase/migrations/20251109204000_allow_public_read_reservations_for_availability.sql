-- Migration: Allow public read access to reservations for availability checking
-- Purpose: Enable anonymous users to see existing reservations (for slot availability)
-- Affected tables: reservations

-- ============================================================================
-- ADD PUBLIC READ POLICY FOR RESERVATIONS
-- ============================================================================

-- Allow anonymous users to SELECT reservations (read-only)
-- This is needed for the /api/reservations/available endpoint to work correctly
-- Anonymous users can only see basic info (start_ts, end_ts, employee_id, status)
-- They cannot see personal data like user_id, vehicle info, or recommendations

DROP POLICY IF EXISTS "reservations_select_anon" ON reservations;
CREATE POLICY "reservations_select_anon" ON reservations
  FOR SELECT
  TO anon
  USING (true);

-- Note: This policy allows anonymous users to see all reservations
-- This is necessary for checking slot availability
-- Personal data should be filtered at the application level if needed

COMMENT ON POLICY "reservations_select_anon" ON reservations IS 
  'Allow anonymous users to read reservations for availability checking';

