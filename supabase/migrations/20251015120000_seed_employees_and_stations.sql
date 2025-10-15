-- migration: seed employees with schedules
-- purpose: insert three mechanic employees with daily schedules for all weekdays in 2025 and 2026
-- affected tables: employees, employee_schedules

-- insert three mechanic employees
insert into employees (id, name, surname, email, type)
values
  (gen_random_uuid(), 'Mechanik1', 'Nowak', 'mechanik1@example.com', 'Mechanic'),
  (gen_random_uuid(), 'Mechanik2', 'Kowalski', 'mechanic2@example.com', 'Mechanic'),
  (gen_random_uuid(), 'Mechanik3', 'Wiśniewski', 'mechanic3@example.com', 'Mechanic');

-- seed schedules for each mechanic for all weekdays between 2025-01-01 and 2026-12-31
-- working hours: 08:00 - 16:00 each day
insert into employee_schedules (employee_id, start_ts, end_ts)
select e.id,
       d::timestamptz + time '08:00',
       d::timestamptz + time '16:00'
from employees e
cross join generate_series('2025-01-01'::date, '2026-12-31'::date, '1 day') d
where e.name in ('Mechanik1', 'Mechanik2', 'Mechanik3')
  and extract(isodow from d) between 1 and 5;
