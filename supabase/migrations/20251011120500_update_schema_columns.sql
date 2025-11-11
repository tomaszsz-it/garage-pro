-- Migration: Update Database Schema - Column Renames and Additions
-- Purpose: Rename columns in employee_schedules and vehicles tables, add description to services
-- Affected tables: employee_schedules, services, vehicles
-- Special considerations: Column renames require dropping and recreating indexes and constraints

-- ============================================================================
-- TABLE: employee_schedules - Rename columns from/to to start_ts/end_ts
-- ============================================================================

-- Drop existing indexes that reference the columns being renamed
drop index if exists idx_employee_schedules_from;
drop index if exists idx_employee_schedules_to;

-- Drop existing constraint that references the columns being renamed
alter table employee_schedules drop constraint if exists valid_schedule_time_range;

-- Rename 'from' column to 'start_ts'
alter table employee_schedules rename column "from" to start_ts;

-- Rename 'to' column to 'end_ts'  
alter table employee_schedules rename column "to" to end_ts;

-- Recreate the time range constraint with new column names
alter table employee_schedules
  add constraint valid_schedule_time_range
  check (start_ts < end_ts);

-- Recreate indexes with new column names
create index idx_employee_schedules_start_ts on employee_schedules(start_ts);
create index idx_employee_schedules_end_ts on employee_schedules(end_ts);

-- ============================================================================
-- TABLE: services - Add description column
-- ============================================================================

-- Add nullable description column to services table
alter table services add column description varchar(200);

-- ============================================================================
-- TABLE: vehicles - Rename type column to car_type
-- ============================================================================

-- Rename 'type' column to 'car_type' in vehicles table
alter table vehicles rename column type to car_type;

-- ============================================================================
-- COMMENTS - Update documentation for modified tables
-- ============================================================================

comment on column employee_schedules.start_ts is 'Schedule start timestamp';
comment on column employee_schedules.end_ts is 'Schedule end timestamp';
comment on column services.description is 'Optional service description';
comment on column vehicles.car_type is 'Vehicle type/category';
