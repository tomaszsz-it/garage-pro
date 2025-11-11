-- Create mechanics (employees)
INSERT INTO employees (id, name, surname, email, type, created_at)
VALUES 
  (gen_random_uuid(), 'Mechanik1', 'Kowalski', 'mechanik1@garage.pro', 'Mechanic', NOW()),
  (gen_random_uuid(), 'Mechanik2', 'Nowak', 'mechanik2@garage.pro', 'Mechanic', NOW()),
  (gen_random_uuid(), 'Mechanik3', 'Wiśniewski', 'mechanik3@garage.pro', 'Mechanic', NOW());

-- Function to generate working days schedule (excluding Polish holidays)
CREATE OR REPLACE FUNCTION generate_working_days(start_date date, end_date date)
RETURNS TABLE (work_date date) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE dates AS (
    SELECT start_date AS date
    UNION ALL
    SELECT date + 1
    FROM dates
    WHERE date < end_date
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
  SELECT d.date
  FROM dates d
  WHERE 
    EXTRACT(DOW FROM d.date) NOT IN (0, 6) -- Exclude weekends
    AND NOT EXISTS (
      SELECT 1 
      FROM holidays h 
      WHERE h.date = d.date
    );
END;
$$ LANGUAGE plpgsql;

-- Generate employee schedules for 2025-2026
-- FIXED: Use explicit timezone to ensure consistent interpretation
INSERT INTO employee_schedules (employee_id, start_ts, end_ts)
SELECT 
  e.id as employee_id,
  (d.work_date + '08:00:00'::time) AT TIME ZONE 'Europe/Warsaw' as start_ts,
  (d.work_date + '16:00:00'::time) AT TIME ZONE 'Europe/Warsaw' as end_ts
FROM 
  employees e
CROSS JOIN 
  generate_working_days('2025-01-01'::date, '2026-12-31'::date) d;

-- Add basic services for testing
INSERT INTO services (service_id, name, duration_minutes, description, created_at)
VALUES 
  (1, 'Wymiana oleju', 30, 'Wymiana oleju silnikowego wraz z filtrem', NOW()),
  (2, 'Przegląd hamulców', 45, 'Kompleksowy przegląd układu hamulcowego', NOW()),
  (3, 'Wymiana opon', 60, 'Wymiana 4 opon z wyważaniem', NOW());

-- Add test vehicle for API testing
INSERT INTO vehicles (license_plate, brand, model, user_id, created_at)
VALUES ('TEST123', 'Toyota', 'Corolla', '606bb2b1-f97f-40d4-bfb9-97e1e59dc6c4', NOW());