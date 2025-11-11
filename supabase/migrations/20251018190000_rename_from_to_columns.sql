-- Migration: Rename columns from/to to start_ts/end_ts in employee_schedules
-- Purpose: Ensure consistent naming conventions for schedule timestamps

-- Drop existing indexes referencing old columns
DROP INDEX IF EXISTS idx_employee_schedules_from;
DROP INDEX IF EXISTS idx_employee_schedules_to;

-- Drop constraint referencing old column names
ALTER TABLE employee_schedules DROP CONSTRAINT IF EXISTS valid_schedule_time_range;

-- Rename columns
ALTER TABLE employee_schedules RENAME COLUMN "from" TO start_ts;
ALTER TABLE employee_schedules RENAME COLUMN "to" TO end_ts;

-- Recreate constraint with new column names
ALTER TABLE employee_schedules
  ADD CONSTRAINT valid_schedule_time_range
  CHECK (start_ts < end_ts);

-- Recreate indexes with new column names
CREATE INDEX IF NOT EXISTS idx_employee_schedules_start_ts ON employee_schedules(start_ts);
CREATE INDEX IF NOT EXISTS idx_employee_schedules_end_ts ON employee_schedules(end_ts);
