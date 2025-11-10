-- Migration: Fix overlap constraint to exclude cancelled reservations
-- Purpose: Allow re-booking of cancelled time slots
-- Affected tables: reservations

-- ============================================================================
-- DROP OLD CONSTRAINT
-- ============================================================================

-- Remove the old exclusion constraint that doesn't check status
ALTER TABLE reservations 
  DROP CONSTRAINT IF EXISTS no_employee_time_overlap;

-- ============================================================================
-- CREATE NEW CONSTRAINT WITH PARTIAL INDEX
-- ============================================================================

-- Create partial exclusion constraint that only applies to non-cancelled reservations
-- This allows the same time slot to be booked again after cancellation
ALTER TABLE reservations
  ADD CONSTRAINT no_employee_time_overlap
  EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(start_ts, end_ts, '[]') WITH &&
  )
  WHERE (status != 'Cancelled');

-- ============================================================================
-- CLEANUP: Delete existing cancelled reservation blocking slot
-- ============================================================================

-- Remove the cancelled reservation that's blocking the 07:00 slot
DELETE FROM reservations 
WHERE id = '2106aaa9-55e5-4ff1-afbf-c7261cb20ea9'
  AND status = 'Cancelled';

COMMENT ON CONSTRAINT no_employee_time_overlap ON reservations IS 
  'Prevent overlapping reservations for same employee (excludes cancelled reservations)';

