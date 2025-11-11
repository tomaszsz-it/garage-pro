-- Migration: Re-enable RLS for all tables with proper policies
-- Purpose: Enable Row Level Security after authentication implementation
-- Affected tables: vehicles, services, reservations

-- ============================================================================
-- RE-ENABLE RLS FOR ALL TABLES
-- ============================================================================

-- Enable RLS for vehicles table
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Enable RLS for services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Enable RLS for reservations table
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFY POLICIES EXIST (policies were created in initial migration)
-- ============================================================================

-- The following policies should already exist from 20251011120000_create_garage_pro_schema.sql:
-- 
-- VEHICLES:
-- - vehicles_select_authenticated: Users can only select their own vehicles (auth.uid() = user_id)
-- - vehicles_insert_authenticated: Users can only insert their own vehicles (auth.uid() = user_id)
-- - vehicles_update_authenticated: Users can only update their own vehicles (auth.uid() = user_id)
-- - vehicles_delete_authenticated: Users can only delete their own vehicles (auth.uid() = user_id)
-- - vehicles_select_anon: Anonymous users cannot select vehicles (false)
--
-- RESERVATIONS:
-- - reservations_select_authenticated: Users can only select their own reservations (auth.uid() = user_id)
-- - reservations_insert_authenticated: Users can only insert reservations for themselves (auth.uid() = user_id and auth.uid() = created_by)
-- - reservations_update_authenticated: Users can only update their own reservations (auth.uid() = user_id)
-- - reservations_delete_authenticated: Users can only delete their own reservations (auth.uid() = user_id)
-- - reservations_select_anon: Anonymous users cannot select reservations (false)
--
-- SERVICES:
-- - services_select_authenticated: All authenticated users can select services (true)
-- - services_select_anon: All anonymous users can select services (true)
-- - services_insert_authenticated: Only authenticated users can insert services (true)
-- - services_update_authenticated: Only authenticated users can update services (true)
-- - services_delete_authenticated: Only authenticated users can delete services (true)

-- ============================================================================
-- ADDITIONAL POLICIES FROM 20251015203100_update_reservation_status_and_rls.sql
-- ============================================================================

-- The following secretariat policies should already exist:
--
-- VEHICLES (Secretariat):
-- - vehicles_select_secretariat: Secretariat can select all vehicles
-- - vehicles_insert_secretariat: Secretariat can insert all vehicles
-- - vehicles_update_secretariat: Secretariat can update all vehicles
-- - vehicles_delete_secretariat: Secretariat can delete all vehicles
--
-- RESERVATIONS (Secretariat):
-- - reservations_select_secretariat: Secretariat can select all reservations
-- - reservations_insert_secretariat: Secretariat can insert all reservations
-- - reservations_update_secretariat: Secretariat can update all reservations
-- - reservations_delete_secretariat: Secretariat can delete all reservations

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- To verify policies are working, run these queries as an authenticated user:
-- 
-- Test 1: Check if user can see their own vehicles
-- SELECT * FROM vehicles WHERE user_id = auth.uid();
--
-- Test 2: Check if user can see their own reservations
-- SELECT * FROM reservations WHERE user_id = auth.uid();
--
-- Test 3: Check if user can see all services
-- SELECT * FROM services;

COMMENT ON TABLE vehicles IS 'RLS enabled - users can only access their own vehicles';
COMMENT ON TABLE reservations IS 'RLS enabled - users can only access their own reservations';
COMMENT ON TABLE services IS 'RLS enabled - all users can read services, only authenticated can modify';

