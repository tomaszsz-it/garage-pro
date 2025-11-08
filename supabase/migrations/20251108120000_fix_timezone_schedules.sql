-- Migration: Fix timezone handling in employee schedules
-- Purpose: Ensure schedules are properly interpreted in Europe/Warsaw timezone
-- This fixes the issue where Monday-Friday schedules appear as Sunday-Thursday due to UTC conversion

-- First, let's check if we have any schedules that need fixing
-- Delete existing schedules to regenerate them with proper timezone
DELETE FROM employee_schedules;

-- Regenerate schedules with explicit timezone
-- This ensures Monday 08:00 Europe/Warsaw stays Monday 08:00, not Sunday 23:00 UTC
INSERT INTO employee_schedules (employee_id, start_ts, end_ts)
SELECT 
  e.id as employee_id,
  (d.work_date + '08:00:00'::time) AT TIME ZONE 'Europe/Warsaw' as start_ts,
  (d.work_date + '16:00:00'::time) AT TIME ZONE 'Europe/Warsaw' as end_ts
FROM 
  employees e
CROSS JOIN (
  -- Regenerate working days for 2025-2026 (Monday-Friday, excluding holidays)
  WITH RECURSIVE dates AS (
    SELECT '2025-01-01'::date AS date
    UNION ALL
    SELECT date + 1
    FROM dates
    WHERE date < '2026-12-31'::date
  ),
  holidays AS (
    -- 2025 Polish holidays
    SELECT '2025-01-01'::date AS date UNION ALL -- New Year
    SELECT '2025-01-06' UNION ALL -- Three Kings
    SELECT '2025-04-21' UNION ALL -- Easter Monday
    SELECT '2025-05-01' UNION ALL -- Labor Day
    SELECT '2025-05-03' UNION ALL -- Constitution Day
    SELECT '2025-06-08' UNION ALL -- Pentecost
    SELECT '2025-06-19' UNION ALL -- Corpus Christi
    SELECT '2025-08-15' UNION ALL -- Assumption
    SELECT '2025-11-01' UNION ALL -- All Saints
    SELECT '2025-11-11' UNION ALL -- Independence Day
    SELECT '2025-12-25' UNION ALL -- Christmas
    SELECT '2025-12-26' UNION ALL -- Second Christmas Day

    -- 2026 Polish holidays
    SELECT '2026-01-01' UNION ALL -- New Year
    SELECT '2026-01-06' UNION ALL -- Three Kings
    SELECT '2026-04-06' UNION ALL -- Easter Monday
    SELECT '2026-05-01' UNION ALL -- Labor Day
    SELECT '2026-05-03' UNION ALL -- Constitution Day
    SELECT '2026-05-24' UNION ALL -- Pentecost
    SELECT '2026-06-04' UNION ALL -- Corpus Christi
    SELECT '2026-08-15' UNION ALL -- Assumption
    SELECT '2026-11-01' UNION ALL -- All Saints
    SELECT '2026-11-11' UNION ALL -- Independence Day
    SELECT '2026-12-25' UNION ALL -- Christmas
    SELECT '2026-12-26' -- Second Christmas Day
  )
  SELECT d.date as work_date
  FROM dates d
  WHERE 
    EXTRACT(DOW FROM d.date) NOT IN (0, 6) -- Exclude weekends (Sunday=0, Saturday=6)
    AND NOT EXISTS (
      SELECT 1 
      FROM holidays h 
      WHERE h.date = d.date
    )
) d;

-- Verify the fix by showing a few sample schedules
-- This should show Monday-Friday schedules in Europe/Warsaw timezone
SELECT 
  start_ts AT TIME ZONE 'Europe/Warsaw' as local_start,
  end_ts AT TIME ZONE 'Europe/Warsaw' as local_end,
  EXTRACT(DOW FROM start_ts AT TIME ZONE 'Europe/Warsaw') as day_of_week,
  TO_CHAR(start_ts AT TIME ZONE 'Europe/Warsaw', 'Day DD-MM-YYYY HH24:MI') as formatted
FROM employee_schedules 
WHERE start_ts >= '2025-11-08' AND start_ts < '2025-11-15'
ORDER BY start_ts
LIMIT 10;

