-- Migration: Create Garage Pro Database Schema
-- Purpose: Initialize complete database schema for garage management system
-- Affected tables: employees, services, vehicles, employee_schedules, reservations
-- Special considerations: Includes RLS policies, indexes, and constraints for business logic

-- Enable required extensions
create extension if not exists "btree_gist";

-- ============================================================================
-- TABLE: employees
-- Purpose: Store information about garage employees (mechanics and secretaries)
-- ============================================================================
create table employees (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    surname varchar(100) not null,
    email varchar(255) not null unique,
    type varchar(50) not null check (type in ('Mechanic', 'Secretary')),
    created_at timestamptz not null default now()
);

-- Enable RLS for employees table
alter table employees enable row level security;

-- RLS Policy: Allow authenticated users to select all employees
create policy "employees_select_authenticated" on employees
    for select
    to authenticated
    using (true);

-- RLS Policy: Allow anonymous users to select all employees (for public booking interface)
create policy "employees_select_anon" on employees
    for select
    to anon
    using (true);

-- RLS Policy: Only authenticated users can insert employees
create policy "employees_insert_authenticated" on employees
    for insert
    to authenticated
    with check (true);

-- RLS Policy: Only authenticated users can update employees
create policy "employees_update_authenticated" on employees
    for update
    to authenticated
    using (true);

-- RLS Policy: Only authenticated users can delete employees
create policy "employees_delete_authenticated" on employees
    for delete
    to authenticated
    using (true);

-- ============================================================================
-- TABLE: services
-- Purpose: Store available services offered by the garage
-- ============================================================================
create table services (
    service_id serial primary key,
    name varchar(100) not null,
    duration_minutes int not null,
    created_at timestamptz not null default now()
);

-- Enable RLS for services table
alter table services enable row level security;

-- RLS Policy: Allow authenticated users to select all services
create policy "services_select_authenticated" on services
    for select
    to authenticated
    using (true);

-- RLS Policy: Allow anonymous users to select all services (for public booking interface)
create policy "services_select_anon" on services
    for select
    to anon
    using (true);

-- RLS Policy: Only authenticated users can insert services
create policy "services_insert_authenticated" on services
    for insert
    to authenticated
    with check (true);

-- RLS Policy: Only authenticated users can update services
create policy "services_update_authenticated" on services
    for update
    to authenticated
    using (true);

-- RLS Policy: Only authenticated users can delete services
create policy "services_delete_authenticated" on services
    for delete
    to authenticated
    using (true);

-- ============================================================================
-- TABLE: vehicles
-- Purpose: Store customer vehicle information linked to users
-- ============================================================================
create table vehicles (
    license_plate varchar(20) not null primary key,
    user_id uuid not null references auth.users(id),
    vin varchar(17),
    brand varchar(50),
    model varchar(50),
    production_year int,
    type varchar(200),
    created_at timestamptz not null default now()
);

-- Enable RLS for vehicles table
alter table vehicles enable row level security;

-- RLS Policy: Users can only select their own vehicles
create policy "vehicles_select_authenticated" on vehicles
    for select
    to authenticated
    using (auth.uid() = user_id);

-- RLS Policy: Anonymous users cannot select vehicles
create policy "vehicles_select_anon" on vehicles
    for select
    to anon
    using (false);

-- RLS Policy: Users can only insert their own vehicles
create policy "vehicles_insert_authenticated" on vehicles
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- RLS Policy: Users can only update their own vehicles
create policy "vehicles_update_authenticated" on vehicles
    for update
    to authenticated
    using (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own vehicles
create policy "vehicles_delete_authenticated" on vehicles
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- TABLE: employee_schedules
-- Purpose: Store employee work schedules for availability management
-- ============================================================================
create table employee_schedules (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references employees(id),
    "from" timestamptz not null,  -- schedule start (using quotes as 'from' is reserved)
    "to" timestamptz not null     -- schedule end (using quotes as 'to' is reserved)
);

-- Enable RLS for employee_schedules table
alter table employee_schedules enable row level security;

-- RLS Policy: Allow authenticated users to select all employee schedules
create policy "employee_schedules_select_authenticated" on employee_schedules
    for select
    to authenticated
    using (true);

-- RLS Policy: Allow anonymous users to select all employee schedules (for booking availability)
create policy "employee_schedules_select_anon" on employee_schedules
    for select
    to anon
    using (true);

-- RLS Policy: Only authenticated users can insert employee schedules
create policy "employee_schedules_insert_authenticated" on employee_schedules
    for insert
    to authenticated
    with check (true);

-- RLS Policy: Only authenticated users can update employee schedules
create policy "employee_schedules_update_authenticated" on employee_schedules
    for update
    to authenticated
    using (true);

-- RLS Policy: Only authenticated users can delete employee schedules
create policy "employee_schedules_delete_authenticated" on employee_schedules
    for delete
    to authenticated
    using (true);

-- ============================================================================
-- TABLE: reservations
-- Purpose: Store service reservations/bookings with full audit trail
-- ============================================================================
create table reservations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    created_by uuid not null references auth.users(id),
    service_id int not null references services(service_id),
    vehicle_license_plate varchar(20) not null references vehicles(license_plate),
    employee_id uuid not null references employees(id),
    start_ts timestamptz not null,
    end_ts timestamptz not null,
    status varchar(20) not null check (status in ('New', 'Cancelled', 'Done')),
    recommendation_text varchar(2000) not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS for reservations table
alter table reservations enable row level security;

-- RLS Policy: Users can only select their own reservations
create policy "reservations_select_authenticated" on reservations
    for select
    to authenticated
    using (auth.uid() = user_id);

-- RLS Policy: Anonymous users cannot select reservations
create policy "reservations_select_anon" on reservations
    for select
    to anon
    using (false);

-- RLS Policy: Users can only insert reservations for themselves
create policy "reservations_insert_authenticated" on reservations
    for insert
    to authenticated
    with check (auth.uid() = user_id and auth.uid() = created_by);

-- RLS Policy: Users can only update their own reservations
create policy "reservations_update_authenticated" on reservations
    for update
    to authenticated
    using (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own reservations
create policy "reservations_delete_authenticated" on reservations
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- INDEXES
-- Purpose: Optimize query performance for foreign key lookups and searches
-- ============================================================================

-- Foreign key indexes for reservations table
create index idx_reservations_user_id on reservations(user_id);
create index idx_reservations_created_by on reservations(created_by);
create index idx_reservations_employee_id on reservations(employee_id);
create index idx_reservations_service_id on reservations(service_id);
create index idx_reservations_vehicle_license_plate on reservations(vehicle_license_plate);

-- Vehicle lookups index
create index idx_vehicles_user_id on vehicles(user_id);

-- Employee schedules index
create index idx_employee_schedules_employee_id on employee_schedules(employee_id);

-- Time-based indexes for scheduling queries
create index idx_reservations_start_ts on reservations(start_ts);
create index idx_reservations_end_ts on reservations(end_ts);
create index idx_employee_schedules_from on employee_schedules("from");
create index idx_employee_schedules_to on employee_schedules("to");

-- Status index for filtering reservations
create index idx_reservations_status on reservations(status);

-- ============================================================================
-- CONSTRAINTS
-- Purpose: Enforce business rules at database level
-- ============================================================================

-- CRITICAL: Prevent overlapping bookings per mechanic
-- This constraint ensures no employee can be double-booked
alter table reservations
  add constraint no_employee_time_overlap
  exclude using gist (
    employee_id with =,
    tstzrange(start_ts, end_ts, '[]') with &&
  );

-- Ensure reservation time range is valid (start before end)
alter table reservations
  add constraint valid_reservation_time_range
  check (start_ts < end_ts);

-- Ensure employee schedule time range is valid (from before to)
alter table employee_schedules
  add constraint valid_schedule_time_range
  check ("from" < "to");

-- ============================================================================
-- TRIGGERS
-- Purpose: Automatically update timestamps and maintain data integrity
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at on reservations
create trigger update_reservations_updated_at
    before update on reservations
    for each row
    execute function update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- Purpose: Document table and column purposes for future maintenance
-- ============================================================================

comment on table employees is 'Garage staff including mechanics and secretaries';
comment on table services is 'Available services offered by the garage';
comment on table vehicles is 'Customer vehicles linked to user accounts';
comment on table employee_schedules is 'Work schedules for employee availability';
comment on table reservations is 'Service bookings with full audit trail';

comment on column reservations.user_id is 'Vehicle owner (customer)';
comment on column reservations.created_by is 'User who created the reservation (could be staff)';
comment on column reservations.recommendation_text is 'Post-service recommendations from mechanic';
