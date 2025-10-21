# REST API Plan

## 1. Resources
- Employees — table `employees`
- Services — table `services`
- Vehicles — table `vehicles`
- EmployeeSchedules — table `employee_schedules`
- Reservations — table `reservations`
- Availability — derived resource computed from `employee_schedules`, `reservations`, `services`
- KPI — derived analytics (e.g., cancellations), computed from `reservations`
- Auth/Users — identity via Supabase Auth (`auth.users`), referenced by `reservations.user_id` and `reservations.created_by`

Assumptions and notes:
- Pagination uses limit/offset and stable sort keys.

## 2. Endpoints

Base path: `/api/v1`

Conventions:
- Query pagination: `?limit=number&offset=number` (defaults: `limit=20`, `offset=0`, max `limit=100`).
- Sorting: `?sort=field&order=asc|desc`. Defaults per endpoint (see below).
- Filtering: explicit query parameters listed per endpoint.
- Error payload shape:
```json
{
  "error": { "code": "string", "message": "human readable", "details": { "field": "msg" } }
}
```

### 2.1 Services
- Backed by `services(service_id, name, duration_minutes, description?, created_at)`

GET /services
- Description: List public service definitions.
- Query params: `limit`, `offset`, `sort` (name|duration_minutes|created_at), `order`.
- Response 200 JSON:
```json
{
  "items": [
    { "service_id": 1, "name": "Oil change", "duration_minutes": 30, "description": "...", "created_at": "2025-10-11T12:00:00Z" }
  ],
  "total": 42
}
```
- Errors: 500.
- Auth: public (anon allowed via RLS).

POST /services
- Description: Create a service (admin only).
- Request JSON:
```json
{ "name": "string", "duration_minutes": 30, "description": "optional" }
```
- Response 201 JSON: created row.
- Errors: 400 (validation), 401/403 (authz), 409 (conflict unique name if enforced in app), 500.
- Auth: `Secretary`/admin only (via Service Role or RLS claim).

GET /services/{service_id}
- Description: Get a service.
- Response 200 JSON: row.
- Errors: 404, 500.
- Auth: public.

PATCH /services/{service_id}
- Description: Update service (admin only).
- Request JSON: any subset of { name, duration_minutes, description }.
- Response 200 JSON: updated row.
- Errors: 400, 401/403, 404, 500.
- Auth: `Secretary`/admin only.

DELETE /services/{service_id}
- Description: Delete service (admin only).
- Response 204.
- Errors: 401/403, 404, 409 (if FK in use), 500.
- Auth: `Secretary`/admin only.

### 2.2 Employees
- Backed by `employees(id, name, surname, email, type, created_at)`

GET /employees
- Description: List employees for public directory and scheduling.
- Query params: `type` (Mechanic|Secretary), `limit`, `offset`, `sort` (surname|name|created_at), `order`.
- Response 200 JSON: items + total.
- Errors: 500.
- Auth: public (anon allowed via RLS).

POST /employees
- Description: Create an employee (admin only).
- Request JSON:
```json
{ "name": "string", "surname": "string", "email": "user@example.com", "type": "Mechanic" }
```
- Response 201 JSON: row.
- Errors: 400, 401/403, 409 (email unique), 500.
- Auth: `Secretary`/admin only.

GET /employees/{id}
- Description: Get single employee by id.
- Response 200 JSON: row.
- Errors: 404, 500.
- Auth: public.

PATCH /employees/{id}
- Description: Update employee (admin only).
- Request JSON: any subset of { name, surname, email, type }.
- Response 200 JSON: updated row.
- Errors: 400, 401/403, 404, 409 (email unique), 500.
- Auth: `Secretary`/admin only.

DELETE /employees/{id}
- Description: Delete employee (admin only).
- Response 204.
- Errors: 401/403, 404, 409 (FK references), 500.
- Auth: `Secretary`/admin only.

### 2.3 Employee Schedules
- Backed by `employee_schedules(id, employee_id, start_ts, end_ts)`

GET /employee-schedules
- Description: List schedules for mechanics (browse availability windows).
- Query params: `employee_id`, `from` (ISO), `to` (ISO), `limit`, `offset`, `sort` (start_ts|end_ts|employee_id), `order`.
- Response 200 JSON: items + total.
- Errors: 400 (date parsing), 500.
- Auth: public (anon allowed via RLS) for read.

POST /employee-schedules
- Description: Create schedule blocks (admin only).
- Request JSON:
```json
{ "employee_id": "uuid", "start_ts": "2025-11-10T08:00:00Z", "end_ts": "2025-11-10T16:00:00Z" }
```
- Response 201 JSON: row.
- Errors: 400, 401/403, 409 (overlapping blocks allowed by DB but may be rejected by API validation), 500.
- Auth: `Secretary`/admin only.

DELETE /employee-schedules/{id}
- Description: Delete a schedule block (admin only).
- Response 204.
- Errors: 401/403, 404, 500.
- Auth: `Secretary`/admin only.

### 2.4 Vehicles
- Backed by `vehicles(license_plate, user_id, vin?, brand?, model?, production_year?, car_type?, created_at)`

GET /vehicles
- Description: List vehicles owned by the current user.
- Query params: `license_plate` (prefix match), `limit`, `offset`, `sort` (created_at|license_plate|brand|model|production_year), `order`.
- Response 200 JSON: items + total.
- Errors: 401 (if unauthenticated), 500.
- Auth: authenticated; RLS restricts to `auth.uid() = user_id`.

POST /vehicles
- Description: Add a vehicle for the current user.
- Request JSON:
```json
{ "license_plate": "WWA12345", "vin": "optional", "brand": "", "model": "", "production_year": 2017, "car_type": "" }
```
- Response 201 JSON: row (with `user_id` set from JWT in server code).
- Errors: 400, 401, 409 (duplicate plate owned by user), 500.
- Auth: authenticated.

GET /vehicles/{license_plate}
- Description: Get own vehicle by plate.
- Response 200 JSON: row.
- Errors: 401, 404, 500.
- Auth: authenticated, RLS enforced.

PATCH /vehicles/{license_plate}
- Description: Update own vehicle.
- Request JSON: any subset of { vin, brand, model, production_year, car_type }.
- Response 200 JSON: updated row.
- Errors: 400, 401, 404, 500.
- Auth: authenticated.

DELETE /vehicles/{license_plate}
- Description: Remove own vehicle.
- Response 204.
- Errors: 401, 404, 409 (FK reserved), 500.
- Auth: authenticated.

### 2.5 Reservations
- Backed by `reservations(id, user_id, created_by, service_id, vehicle_license_plate, employee_id, start_ts, end_ts, status, recommendation_text, created_at, updated_at)`

GET /reservations
- Description: List reservations.
- Query params:
  - For users: `status` (New|Cancelled|Done), `from`, `to`, `limit`, `offset`, `sort` (start_ts|created_at|status), `order`.
  - For secretariat/admin: above plus `user_id`, `employee_id`, `service_id`.
- Response 200 JSON: items + total.
- Errors: 401 (user), 403 (if not allowed to see others), 500.
- Auth: user sees own via RLS; secretariat can see all via Service Role client or RLS claim.

POST /reservations
- Description: Create a reservation.
- Request JSON (user self-booking):
```json
{ "service_id": 1, "vehicle_license_plate": "WWA12345", "employee_id": "uuid", "start_ts": "2025-10-20T09:00:00Z" }
```
- Optional request JSON (staff booking for a customer):
```json
{ "user_id": "customer-auth-uuid", "service_id": 1, "vehicle_license_plate": "WWA12345", "employee_id": "uuid", "start_ts": "2025-10-20T09:00:00Z", "allow_schedule_override": false }
```
- Behavior:
  - `end_ts` is derived: `start_ts + services.duration_minutes`.
  - `created_by` set to JWT subject.
  - If `allow_schedule_override` is true, API may bypass schedule window validation but still must respect DB exclusion constraint (no mechanic double-booking).
- Response 201 JSON: created row.
- Errors: 400 (validation), 401/403, 404 (vehicle not owned by user; employee/service missing), 409 (time overlap), 422 (outside schedule unless override), 500.
- Auth: authenticated; staff path requires Service Role or RLS claim.

GET /reservations/{id}
- Description: Get reservation by id.
- Response 200 JSON: row.
- Errors: 401/403 (not owner), 404, 500.
- Auth: user own via RLS; secretariat any via Service Role or RLS claim.

PATCH /reservations/{id}
- Description: Edit reservation (before start time). Allowed fields: `service_id`, `vehicle_license_plate`, `employee_id`, `start_ts`.
- Request JSON: subset of allowed fields.
- Behavior: recompute `end_ts` if `service_id` or `start_ts` changed.
- Response 200 JSON: updated row.
- Errors: 400, 401/403, 404, 409 (overlap), 422 (outside schedule), 500.
- Auth: user on own reservations; secretariat on any.

POST /reservations/{id}/cancel
- Description: Cancel reservation; frees slot immediately (status = Cancelled).
- Response 200 JSON: updated row ({ status: "Cancelled" }).
- Errors: 400 (already Done), 401/403, 404, 500.
- Auth: user own; secretariat any.

POST /reservations/{id}/complete
- Description: Mark as Done and optionally set `recommendation_text`.
- Request JSON:
```json
{ "recommendation_text": "optional string" }
```
- Response 200 JSON: updated row.
- Errors: 401/403, 404, 409 (already Cancelled), 500.
- Auth: secretariat only by default; optionally user can mark done if business rules allow.

PUT /reservations/{id}/recommendation
- Description: Update recommendation text (e.g., by AI or mechanic after service).
- Request JSON:
```json
{ "recommendation_text": "string" }
```
- Response 200 JSON: updated row.
- Errors: 401/403, 404, 500.
- Auth: secretariat only.

### 2.6 Availability
- Derived from `employee_schedules` minus overlapping `reservations` and respecting `services.duration_minutes` and unlock window policy.

GET /availability
- Description: Compute nearest available time slots for booking.
- Query params:
  - `service_id` (required)
  - `from` (ISO, default now)
  - `to` (ISO, default `from + 30 days`)
  - `employee_id` (optional filter)
  - `limit` (default 10, max 100)
  - `granularity_minutes` (default 15)
- Response 200 JSON:
```json
{
  "service_id": 1,
  "items": [
    { "employee_id": "uuid", "start_ts": "2025-10-20T09:00:00Z", "end_ts": "2025-10-20T09:30:00Z" }
  ]
}
```
- Errors: 400 (params), 404 (service_id not found), 500.
- Auth: public read (anon allowed) to support pre-login browsing.
- Notes: If current date < 10th of month, only show slots within current month; next month’s slots unlock on the 10th (policy enforced in API computation).

### 2.7 KPI

GET /kpi/cancellations
- Description: Report the number of cancelled reservations from the previous month (or provided month).
- Query params: `month=YYYY-MM` (optional; default previous month).
- Response 200 JSON:
```json
{ "month": "2025-09", "cancelled_count": 12 }
```
- Errors: 401/403, 500.
- Auth: secretariat only.

## 3. Authentication and Authorization

Mechanism: Supabase Auth (JWT) with Astro middleware attaching a Supabase client on `context.locals.supabase`.

- Public read endpoints (e.g., `GET /services`, `GET /employees`, `GET /employee-schedules`, `GET /availability`) are allowed via RLS policies already present.
- User-scoped endpoints (vehicles, own reservations) rely on RLS (`auth.uid() = user_id`) to restrict data.
- Secretariat/Admin access:
  - Option A (recommended): Add a JWT claim `role` (e.g., via Supabase `app_metadata`) and extend RLS:
    - `reservations`: allow `select/insert/update/delete` when `auth.jwt() ->> 'role' = 'Secretary'`.
    - For staff-created reservations: relax insert check to `(auth.uid() = created_by)` and no restriction on `user_id` for `role='Secretary'`.
  - Option B: Use a server-side Supabase client with Service Role key in API routes handling staff operations; bypass RLS and enforce authorization in code (check user’s staff role in your own `users`/`employees` mapping or app_metadata).

Implementation details in Astro:
- Keep the existing anon client for public and user-scoped operations.
- Create a second server-only client with `SUPABASE_SERVICE_ROLE_KEY` for staff endpoints.
- Read JWT from request (cookies/Authorization header), verify, and map to a user role before allowing staff endpoints.

Rate limiting and security:
- Apply per-IP and per-user rate limits to write endpoints (e.g., 60 req/minute) and to `/availability` (e.g., 120 req/minute).
- Require HTTPS; reject with 400 if timestamps are not valid ISO.
- Validate all inputs with Zod (typesafe). Return 400 with details on validation errors.
- Use 409 for time-range conflicts detected by the DB exclusion constraint.

## 4. Validation and Business Logic

Common validation (Zod recommended):
- `license_plate`: non-empty, normalized uppercase w/o spaces.
- `duration_minutes`: positive integer (e.g., 5–480).
- Timestamps: valid ISO-8601; `start_ts < end_ts`.
- `status`: one of `New|Cancelled|Done` 

Reservations specific:
- Derive `end_ts = start_ts + duration_minutes` from the chosen `service_id`.
- Reject creating/updating when:
  - the time window overlaps existing reservation for the same `employee_id` (DB will enforce; map DB error to HTTP 409 with code `TIME_OVERLAP`).


- State transitions:
  - New → Cancelled: allowed.
  - New → Done: allowed.
  - Cancelled/Done → any: not allowed (400 `INVALID_STATE`).

Availability computation:
- Input: `service_id`, date range, optional `employee_id`.
- Steps:
  1) Get `duration_minutes` for the service.
  2) Collect schedule windows within `[from, to]` 
  3) Subtract reserved intervals (status != Cancelled) for each `employee_id`.
  4) Slice remaining intervals into slots of length `duration_minutes`, aligned to `granularity_minutes`.
  5) Return the first `limit` slots.
- Performance: leverage indexes on `employee_id`, `start_ts`, `end_ts`, `status` as defined in migrations.




- Prevent overlapping schedule blocks for the same employee in API (even if DB allows), to keep availability logic simple.

Override capacity (optional enhancement):
- To truly allow double-booking a mechanic for special cases, add `admin_override boolean not null default false` to `reservations`, and change exclusion constraint to apply only when `admin_override=false`:
  ```sql
  alter table reservations drop constraint if exists no_employee_time_overlap;
  alter table reservations add constraint no_employee_time_overlap
    exclude using gist (
      employee_id with =,
      tstzrange(start_ts, end_ts, '[]') with &&
    ) where (admin_override = false);
  ```
- Restrict `admin_override=true` to `Secretary` via RLS or Service Role API path.

Error codes (non-exhaustive):
- 400 `VALIDATION_ERROR`, `INVALID_STATE`, `INVALID_TIMESTAMP`
- 401 `UNAUTHENTICATED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `TIME_OVERLAP`, `CONFLICT`
- 422 `OUTSIDE_SCHEDULE`
- 429 `RATE_LIMITED`
- 500 `INTERNAL_ERROR`

### Payload Schemas (reference)

Service
```json
{ "service_id": 1, "name": "string", "duration_minutes": 30, "description": "string|null", "created_at": "ISO" }
```

Employee
```json
{ "id": "uuid", "name": "string", "surname": "string", "email": "string", "type": "Mechanic|Secretary", "created_at": "ISO" }
```

Vehicle
```json
{ "license_plate": "string", "user_id": "uuid", "vin": "string|null", "brand": "string|null", "model": "string|null", "production_year": 2017, "car_type": "string|null", "created_at": "ISO" }
```

EmployeeSchedule
```json
{ "id": "uuid", "employee_id": "uuid", "start_ts": "ISO", "end_ts": "ISO" }
```

Reservation
```json
{ "id": "uuid", "user_id": "uuid", "created_by": "uuid", "service_id": 1, "vehicle_license_plate": "string", "employee_id": "uuid", "start_ts": "ISO", "end_ts": "ISO", "status": "New|Cancelled|Done", "recommendation_text": "string", "created_at": "ISO", "updated_at": "ISO" }
```

Pagination wrapper
```json
{ "items": [/* rows */], "total": 123 }
```
