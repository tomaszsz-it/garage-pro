-- Migration: Fix secretariat policies that use app.user_role
-- Purpose: Remove policies that depend on current_setting('app.user_role') which is not set
-- Affected tables: vehicles, reservations

-- ============================================================================
-- DROP PROBLEMATIC SECRETARIAT POLICIES
-- ============================================================================

-- Drop secretariat policies for vehicles
DROP POLICY IF EXISTS "vehicles_select_secretariat" ON vehicles;
DROP POLICY IF EXISTS "vehicles_insert_secretariat" ON vehicles;
DROP POLICY IF EXISTS "vehicles_update_secretariat" ON vehicles;
DROP POLICY IF EXISTS "vehicles_delete_secretariat" ON vehicles;

-- Drop secretariat policies for reservations
DROP POLICY IF EXISTS "reservations_select_secretariat" ON reservations;
DROP POLICY IF EXISTS "reservations_insert_secretariat" ON reservations;
DROP POLICY IF EXISTS "reservations_update_secretariat" ON reservations;
DROP POLICY IF EXISTS "reservations_delete_secretariat" ON reservations;

-- ============================================================================
-- NOTES
-- ============================================================================
-- These policies were using current_setting('app.user_role') which requires
-- setting the parameter in each session, which we're not doing.
-- 
-- For now, we'll rely on the basic authenticated user policies.
-- In the future, if we need secretariat access, we should:
-- 1. Add a 'role' column to auth.users metadata
-- 2. Create policies that check auth.jwt() -> 'role' claim
-- 3. Or use a separate 'user_roles' table with proper RLS policies

