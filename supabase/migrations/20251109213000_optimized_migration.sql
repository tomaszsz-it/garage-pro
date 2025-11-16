-- ============================================================================
-- Plik: optimized_migration.sql
-- Cel: Zunifikowana, zoptymalizowana migracja dla schematu Garage Pro
-- Opis: Tworzy kompletny schemat bazy danych, RLS, indeksy, ograniczenia
--       oraz wstawia dane początkowe w jednym kroku.
-- ============================================================================

-- ============================================================================
-- KROK 1: Czyszczenie istniejącego stanu (dla bezpieczeństwa)
-- ============================================================================
DROP TABLE IF EXISTS "public"."reservations" CASCADE;
DROP TABLE IF EXISTS "public"."employee_schedules" CASCADE;
DROP TABLE IF EXISTS "public"."vehicles" CASCADE;
DROP TABLE IF EXISTS "public"."services" CASCADE;
DROP TABLE IF EXISTS "public"."employees" CASCADE;
DROP TYPE IF EXISTS "public"."reservation_status" CASCADE;
DROP FUNCTION IF EXISTS "public"."update_updated_at_column" CASCADE;

-- ============================================================================
-- KROK 2: Włączenie rozszerzeń
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================================
-- KROK 3: Definicja typów niestandardowych (ENUM)
-- ============================================================================
CREATE TYPE "public"."reservation_status" AS ENUM ('New', 'Completed', 'Cancelled');

-- ============================================================================
-- KROK 4: Tworzenie tabel z finalną strukturą
-- ============================================================================

-- Tabela: employees
CREATE TABLE "public"."employees" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Mechanic', 'Secretary')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_employee_name_surname UNIQUE (name, surname)
);
COMMENT ON TABLE "public"."employees" IS 'Pracownicy warsztatu (mechanicy i sekretariat) z unikalnym imieniem i nazwiskiem.';

-- Tabela: services
CREATE TABLE "public"."services" (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration_minutes INT NOT NULL,
    description VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE "public"."services" IS 'Usługi oferowane przez warsztat.';

-- Tabela: vehicles
CREATE TABLE "public"."vehicles" (
    license_plate VARCHAR(20) NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    vin VARCHAR(17),
    brand VARCHAR(50),
    model VARCHAR(50),
    production_year INT,
    car_type VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT vin_length_check CHECK (char_length(vin) = 17)
);
COMMENT ON TABLE "public"."vehicles" IS 'Pojazdy klientów powiązane z ich kontami użytkowników.';

-- Tabela: employee_schedules
CREATE TABLE "public"."employee_schedules" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES "public"."employees"(id) ON DELETE CASCADE,
    start_ts TIMESTAMPTZ NOT NULL,
    end_ts TIMESTAMPTZ NOT NULL,
    CONSTRAINT valid_schedule_time_range CHECK (start_ts < end_ts)
);
COMMENT ON TABLE "public"."employee_schedules" IS 'Harmonogramy pracy pracowników.';

-- Tabela: reservations
CREATE TABLE "public"."reservations" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    service_id INT NOT NULL REFERENCES "public"."services"(service_id),
    vehicle_license_plate VARCHAR(20) NOT NULL REFERENCES "public"."vehicles"(license_plate),
    employee_id UUID NOT NULL REFERENCES "public"."employees"(id),
    start_ts TIMESTAMPTZ NOT NULL,
    end_ts TIMESTAMPTZ NOT NULL,
    status "public"."reservation_status" NOT NULL DEFAULT 'New',
    recommendation_text TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_reservation_time_range CHECK (start_ts < end_ts)
);
COMMENT ON TABLE "public"."reservations" IS 'Rezerwacje usług.';

-- ============================================================================
-- KROK 5: Włączenie Row Level Security (RLS)
-- ============================================================================
ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."employee_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reservations" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- KROK 6: Definicja polityk RLS
-- ============================================================================

-- Polityki dla: employees
CREATE POLICY "employees_select_authenticated" ON "public"."employees" FOR SELECT TO authenticated USING (true);
CREATE POLICY "employees_select_anon" ON "public"."employees" FOR SELECT TO anon USING (true);
CREATE POLICY "employees_insert_authenticated" ON "public"."employees" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "employees_update_authenticated" ON "public"."employees" FOR UPDATE TO authenticated USING (true);
CREATE POLICY "employees_delete_authenticated" ON "public"."employees" FOR DELETE TO authenticated USING (true);

-- Polityki dla: services
CREATE POLICY "services_select_authenticated" ON "public"."services" FOR SELECT TO authenticated USING (true);
CREATE POLICY "services_select_anon" ON "public"."services" FOR SELECT TO anon USING (true);
CREATE POLICY "services_insert_authenticated" ON "public"."services" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "services_update_authenticated" ON "public"."services" FOR UPDATE TO authenticated USING (true);
CREATE POLICY "services_delete_authenticated" ON "public"."services" FOR DELETE TO authenticated USING (true);

-- Polityki dla: vehicles
CREATE POLICY "vehicles_select_authenticated" ON "public"."vehicles" FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "vehicles_select_anon" ON "public"."vehicles" FOR SELECT TO anon USING (false);
CREATE POLICY "vehicles_insert_authenticated" ON "public"."vehicles" FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vehicles_update_authenticated" ON "public"."vehicles" FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "vehicles_delete_authenticated" ON "public"."vehicles" FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Polityki dla: employee_schedules
CREATE POLICY "employee_schedules_select_authenticated" ON "public"."employee_schedules" FOR SELECT TO authenticated USING (true);
CREATE POLICY "employee_schedules_select_anon" ON "public"."employee_schedules" FOR SELECT TO anon USING (true);
CREATE POLICY "employee_schedules_insert_authenticated" ON "public"."employee_schedules" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "employee_schedules_update_authenticated" ON "public"."employee_schedules" FOR UPDATE TO authenticated USING (true);
CREATE POLICY "employee_schedules_delete_authenticated" ON "public"."employee_schedules" FOR DELETE TO authenticated USING (true);

-- Polityki dla: reservations
CREATE POLICY "reservations_select_authenticated" ON "public"."reservations" FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "reservations_select_anon" ON "public"."reservations" FOR SELECT TO anon USING (true);
COMMENT ON POLICY "reservations_select_anon" ON "public"."reservations" IS 'Zezwala anonimowym użytkownikom na odczyt rezerwacji w celu sprawdzenia dostępności.';
CREATE POLICY "reservations_insert_authenticated" ON "public"."reservations" FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND auth.uid() = created_by);
CREATE POLICY "reservations_update_authenticated" ON "public"."reservations" FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "reservations_delete_authenticated" ON "public"."reservations" FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- KROK 7: Tworzenie indeksów
-- ============================================================================
CREATE INDEX idx_reservations_user_id ON "public"."reservations"(user_id);
CREATE INDEX idx_reservations_created_by ON "public"."reservations"(created_by);
CREATE INDEX idx_reservations_employee_id ON "public"."reservations"(employee_id);
CREATE INDEX idx_reservations_service_id ON "public"."reservations"(service_id);
CREATE INDEX idx_reservations_vehicle_license_plate ON "public"."reservations"(vehicle_license_plate);
CREATE INDEX idx_reservations_start_ts ON "public"."reservations"(start_ts);
CREATE INDEX idx_reservations_end_ts ON "public"."reservations"(end_ts);
CREATE INDEX idx_reservations_status ON "public"."reservations"(status);

CREATE INDEX idx_vehicles_user_id ON "public"."vehicles"(user_id);
CREATE UNIQUE INDEX idx_vehicles_vin ON "public"."vehicles"(vin) WHERE vin IS NOT NULL;

CREATE INDEX idx_employee_schedules_employee_id ON "public"."employee_schedules"(employee_id);
CREATE INDEX idx_employee_schedules_start_ts ON "public"."employee_schedules"(start_ts);
CREATE INDEX idx_employee_schedules_end_ts ON "public"."employee_schedules"(end_ts);

-- ============================================================================
-- KROK 8: Dodawanie finalnych ograniczeń (Constraints)
-- ============================================================================
ALTER TABLE "public"."reservations"
  ADD CONSTRAINT no_employee_time_overlap
  EXCLUDE USING GIST (
    employee_id WITH =,
    tstzrange(start_ts, end_ts, '[)') WITH &&
  )
  WHERE (status <> 'Cancelled');
COMMENT ON CONSTRAINT no_employee_time_overlap ON "public"."reservations" IS 'Zapobiega nakładaniu się rezerwacji dla tego samego pracownika, używając półotwartego przedziału [start, end) i ignorując anulowane rezerwacje.';

-- ============================================================================
-- KROK 9: Tworzenie triggerów
-- ============================================================================
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON "public"."reservations"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

-- ============================================================================
-- KROK 10: Wstawianie danych początkowych (Seed)
-- ============================================================================

-- Podstawowe usługi
INSERT INTO "public"."services" (name, duration_minutes, description, created_at)
VALUES 
  ('Wymiana oleju', 30, 'Wymiana oleju silnikowego wraz z filtrem', NOW()),
  ('Przegląd hamulców', 45, 'Kompleksowy przegląd układu hamulcowego', NOW()),
  ('Wymiana opon', 60, 'Wymiana 4 opon z wyważaniem', NOW());

-- Pracownicy (mechanicy)
INSERT INTO "public"."employees" (id, name, surname, email, type, created_at)
VALUES 
  ('aa443cdc-9ca5-4dd0-8308-03440bb81acf', 'Jan', 'Kowalski', 'jan.kowalski@garage.com', 'Mechanic', NOW()),
  ('63e7e7ae-4d1c-40d4-af4a-f268973a929d', 'Stefan', 'Kowalski', 'stefan.kowalski@garage.com', 'Mechanic', NOW());

-- Harmonogramy pracy dla mechaników na najbliższe 3 miesiące
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
    -- Dodaj harmonogram tylko dla dni roboczych (poniedziałek = 1, piątek = 5)
    IF EXTRACT(ISODOW FROM v_current_date) BETWEEN 1 AND 5 THEN
      
      -- Harmonogram dla Jana Kowalskiego (7:00-15:00)
      INSERT INTO "public"."employee_schedules" (employee_id, start_ts, end_ts)
      VALUES (
        v_jan_id,
        (v_current_date + TIME '07:00:00') AT TIME ZONE 'Europe/Warsaw',
        (v_current_date + TIME '15:00:00') AT TIME ZONE 'Europe/Warsaw'
      );
      
      -- Harmonogram dla Stefana Kowalskiego (7:00-15:00)
      INSERT INTO "public"."employee_schedules" (employee_id, start_ts, end_ts)
      VALUES (
        v_stefan_id,
        (v_current_date + TIME '07:00:00') AT TIME ZONE 'Europe/Warsaw',
        (v_current_date + TIME '15:00:00') AT TIME ZONE 'Europe/Warsaw'
      );
      
    END IF;
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;
END $$;

-- ============================================================================
-- Koniec migracji
-- ============================================================================