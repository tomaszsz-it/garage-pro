# Database Schema Plan

## 1. Tables

### users
This table is managed by Supabase Auth.
- id: UUID PRIMARY KEY
- email: varchar(255) NOT NULL UNIQUE
- name: varchar(100) NOT NULL
- surname: varchar(100) NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMPTZ

### employees
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- name: varchar(100) NOT NULL
- surname: varchar(100) NOT NULL
- email: varchar(255) NOT NULL UNIQUE
- type: varchar(50) NOT NULL CHECK (type IN ('Mechanic','Secretary'))
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()


### services
- service_id: SERIAL PRIMARY KEY
- name: varchar(100) NOT NULL
- duration_minutes: INT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### vehicles
- license_plate: varchar(20) NOT NULL PRIMARY KEY 
- user_id: UUID NOT NULL REFERENCES users(id)
- vin: varchar(17) NULLABLE 
- brand: varchar(50)
- model: varchar(50)
- production_year: INT
- type: varchar(200)
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### employee_schedules
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- employee_id: UUID NOT NULL REFERENCES employees(id)
- from: TIMESTAMPTZ NOT NULL  -- schedule start
- to: TIMESTAMPTZ NOT NULL  -- schedule end

### reservations
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL REFERENCES users(id)
- created_by: UUID NOT NULL REFERENCES users(id)
- service_id: INT NOT NULL REFERENCES services(service_id)
- vehicle_license_plate: varchar(20) NOT NULL REFERENCES vehicles(license_plate)
- employee_id: UUID NOT NULL REFERENCES employees(id)
- start_ts: TIMESTAMPTZ NOT NULL
- end_ts: TIMESTAMPTZ NOT NULL
- status: varchar(20) NOT NULL CHECK (status IN ('New','Cancelled','Done'))
- recommendation_text: varchar(2000) NOT NULL DEFAULT ''
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Relationships
- users 1:N vehicles
- users 1:N reservations
- employees 1:N reservations
- employees 1:N employee_schedules
- services 1:N reservations
- vehicles 1:N reservations

## 3. Indexes
```sql
-- Foreign key indexes
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_created_by ON reservations(created_by);
CREATE INDEX idx_reservations_employee_id ON reservations(employee_id);


-- Vehicle lookups
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);

```

## 4. Constraints
```sql
-- Prevent overlapping bookings per mechanic
ALTER TABLE reservations
  ADD CONSTRAINT no_employee_time_overlap
  EXCLUDE USING GIST (
    employee_id WITH =,
    tstzrange(start_ts, end_ts, '[]') WITH &&
  );
```

## 5. Row-Level Security (RLS)
- W tabelach reservations, vehicles wdrożyć polityki RLS, które pozwalają użytkownikowi na dostęp tylko do rekordów, gdzie `user_id` odpowiada identyfikatorowi użytkownika z Supabase Auth (np. auth.uid() = user_id).

