-- Migration: Fix RLS policies to use auth.uid() instead of bypass
-- Purpose: Enable proper row-level security with auth.uid()
-- Affected tables: vehicles, reservations

-- ============================================================================
-- REMOVE TEMPORARY BYPASS POLICIES
-- ============================================================================

-- Remove temporary bypass policies for vehicles
DROP POLICY IF EXISTS "temp_vehicles_select_all_authenticated" ON vehicles;

-- Remove temporary bypass policies for reservations
DROP POLICY IF EXISTS "temp_reservations_select_all_authenticated" ON reservations;

-- ============================================================================
-- VERIFY ORIGINAL POLICIES EXIST
-- ============================================================================

-- Original policies from 20251011120000_create_garage_pro_schema.sql should still exist:
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
-- - reservations_select_anon: Anonymous users can select all reservations (true) - for availability checking

-- ============================================================================
-- TEST auth.uid() functionality
-- ============================================================================

-- To test if auth.uid() works, you can run these queries as an authenticated user:
-- 
-- SELECT auth.uid(); -- Should return your user ID
-- SELECT * FROM vehicles WHERE user_id = auth.uid(); -- Should return only your vehicles
-- SELECT * FROM reservations WHERE user_id = auth.uid(); -- Should return only your reservations

COMMENT ON TABLE vehicles IS 'RLS enabled - users can only access their own vehicles via auth.uid()';
COMMENT ON TABLE reservations IS 'RLS enabled - users can only access their own reservations via auth.uid()';

