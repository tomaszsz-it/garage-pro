-- Migration: Fix constraint to use half-open interval '[)' instead of closed '[]'
-- Purpose: Allow back-to-back reservations (e.g., 07:00-07:30 and 07:30-08:00)
-- Affected tables: reservations

-- ============================================================================
-- DROP OLD CONSTRAINT
-- ============================================================================

ALTER TABLE reservations DROP CONSTRAINT IF EXISTS no_employee_time_overlap;

-- ============================================================================
-- CREATE NEW CONSTRAINT WITH HALF-OPEN INTERVAL
-- ============================================================================

-- Use '[)' interval type:
-- - '[' means start is included (closed)
-- - ')' means end is excluded (open)
-- This allows back-to-back reservations without conflicts
-- Example: [07:00, 07:30) and [07:30, 08:00) do NOT overlap

ALTER TABLE reservations
  ADD CONSTRAINT no_employee_time_overlap
  EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(start_ts, end_ts, '[)') WITH &&
  )
  WHERE (status != 'Cancelled');

COMMENT ON CONSTRAINT no_employee_time_overlap ON reservations IS 
  'Prevent overlapping reservations for same employee using half-open interval [start, end)';

