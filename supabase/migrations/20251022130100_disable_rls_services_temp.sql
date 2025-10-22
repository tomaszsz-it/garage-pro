-- migration: temporarily disable RLS on services table
-- purpose: allow testing without authentication
-- affected tables: services

alter table services disable row level security;
