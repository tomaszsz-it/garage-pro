-- migration: update reservation status and add rls policies for secretariat
-- purpose: create reservation_status enum, alter reservations.status and recommendation_text, add vin constraints, and add secretariat rls policies
-- affected tables: reservations, vehicles

-- create enum type for reservation status values
create type if not exists reservation_status as enum ('New','Cancelled','Done');

-- alter reservations.status to use enum type
-- drop existing default to avoid conflict
alter table reservations alter column status drop default;
-- drop existing check constraint enforcing valid statuses (auto-named by postgres)
alter table reservations drop constraint if exists reservations_status_check;
-- change column type to reservation_status, casting existing values
alter table reservations alter column status type reservation_status using status::reservation_status;
-- set default to 'New'
alter table reservations alter column status set default 'New';

-- alter recommendation_text to text for more flexibility
alter table reservations alter column recommendation_text type text using recommendation_text::text;

-- enforce VIN length and uniqueness on vehicles
-- add constraint to ensure VIN is exactly 17 characters when present
alter table vehicles add constraint vin_length_check check (char_length(vin) = 17);
-- create unique index on non-null VIN values
create unique index if not exists idx_vehicles_vin on vehicles(vin) where vin is not null;

-- add secretariat role policies for vehicles
-- allow secretariat full select access
create policy "vehicles_select_secretariat" on vehicles
  for select
  to authenticated
  using (current_setting('app.user_role') = 'secretariat');
-- allow secretariat full insert access
create policy "vehicles_insert_secretariat" on vehicles
  for insert
  to authenticated
  with check (current_setting('app.user_role') = 'secretariat');
-- allow secretariat full update access
create policy "vehicles_update_secretariat" on vehicles
  for update
  to authenticated
  using (current_setting('app.user_role') = 'secretariat');
-- allow secretariat full delete access
create policy "vehicles_delete_secretariat" on vehicles
  for delete
  to authenticated
  using (current_setting('app.user_role') = 'secretariat');

-- add secretariat role policies for reservations
-- allow secretariat full select access
create policy "reservations_select_secretariat" on reservations
  for select
  to authenticated
  using (current_setting('app.user_role') = 'secretariat');
-- allow secretariat full insert access
create policy "reservations_insert_secretariat" on reservations
  for insert
  to authenticated
  with check (current_setting('app.user_role') = 'secretariat');
-- allow secretariat full update access
create policy "reservations_update_secretariat" on reservations
  for update
  to authenticated
  using (current_setting('app.user_role') = 'secretariat');
-- allow secretariat full delete access
create policy "reservations_delete_secretariat" on reservations
  for delete
  to authenticated
  using (current_setting('app.user_role') = 'secretariat');
