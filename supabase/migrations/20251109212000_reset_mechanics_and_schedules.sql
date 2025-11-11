-- Migration: Reset mechanics and schedules with only 2 mechanics
-- Purpose: Clean up data and add constraint for unique name+surname
-- Affected tables: reservations, employee_schedules, employees

-- ============================================================================
-- STEP 1: DELETE ALL DATA
-- ============================================================================

-- Delete all reservations (cascade will handle foreign keys)
DELETE FROM reservations;

-- Delete all employee schedules
DELETE FROM employee_schedules;

-- Delete all employees
DELETE FROM employees;

-- ============================================================================
-- STEP 2: ADD UNIQUE CONSTRAINT FOR NAME + SURNAME
-- ============================================================================

-- Add unique constraint to prevent duplicate mechanics
ALTER TABLE employees 
  ADD CONSTRAINT unique_employee_name_surname 
  UNIQUE (name, surname);

COMMENT ON CONSTRAINT unique_employee_name_surname ON employees IS 
  'Ensure each employee has a unique combination of name and surname';

-- ============================================================================
-- STEP 3: INSERT 2 NEW MECHANICS
-- ============================================================================

-- Insert Jan Kowalski
INSERT INTO employees (id, name, surname, email, type, created_at)
VALUES (
  'aa443cdc-9ca5-4dd0-8308-03440bb81acf',
  'Jan',
  'Kowalski',
  'jan.kowalski@garage.com',
  'Mechanic',
  NOW()
);

-- Insert Stefan Kowalski
INSERT INTO employees (id, name, surname, email, type, created_at)
VALUES (
  '63e7e7ae-4d1c-40d4-af4a-f268973a929d',
  'Stefan',
  'Kowalski',
  'stefan.kowalski@garage.com',
  'Mechanic',
  NOW()
);

-- ============================================================================
-- STEP 4: GET SCHEDULES FROM EXISTING MECHANICS (Mechanik1 and Mechanik2)
-- ============================================================================

-- Note: We'll create schedules based on typical working hours
-- Monday to Friday, 7:00-15:00 for both mechanics
-- For the next 3 months

-- Helper function to generate work schedules
DO $$
DECLARE
  v_start_date DATE := CURRENT_DATE;
  v_end_date DATE := CURRENT_DATE + INTERVAL '3 months';
  v_current_date DATE;
  v_jan_id UUID := 'aa443cdc-9ca5-4dd0-8308-03440bb81acf';
  v_stefan_id UUID := '63e7e7ae-4d1c-40d4-af4a-f268973a929d';
BEGIN
  v_current_date := v_start_date;
  
  WHILE v_current_date <= v_end_date LOOP
    -- Only add schedules for weekdays (Monday = 1, Friday = 5)
    IF EXTRACT(ISODOW FROM v_current_date) BETWEEN 1 AND 5 THEN
      
      -- Add schedule for Jan Kowalski (7:00-15:00)
      INSERT INTO employee_schedules (employee_id, start_ts, end_ts)
      VALUES (
        v_jan_id,
        v_current_date + TIME '07:00:00',
        v_current_date + TIME '15:00:00'
      );
      
      -- Add schedule for Stefan Kowalski (7:00-15:00)
      INSERT INTO employee_schedules (employee_id, start_ts, end_ts)
      VALUES (
        v_stefan_id,
        v_current_date + TIME '07:00:00',
        v_current_date + TIME '15:00:00'
      );
      
    END IF;
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify employees
SELECT 
  id,
  name,
  surname,
  email,
  type
FROM employees
ORDER BY name;

-- Verify schedules count
SELECT 
  e.name,
  e.surname,
  COUNT(es.id) as schedule_count
FROM employees e
LEFT JOIN employee_schedules es ON e.id = es.employee_id
GROUP BY e.id, e.name, e.surname
ORDER BY e.name;

COMMENT ON TABLE employees IS 'Employees with unique name+surname constraint';

