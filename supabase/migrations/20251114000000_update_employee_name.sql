-- Migration: Update first employee's name to 'Stefan'
-- This migration updates the first record in the 'employees' table (ordered by creation time)

WITH first_employee AS (
  SELECT id
  FROM public.employees
  ORDER BY created_at
  LIMIT 1
)
UPDATE public.employees
SET name = 'Marcin'
WHERE id IN (SELECT id FROM first_employee);
