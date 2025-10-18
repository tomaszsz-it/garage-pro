# REST API Plan

## 1. Resources
- **Vehicle** — `vehicles` table  
- **Reservation** — `reservations` table  

## 2. Endpoints

### 2.1 Vehicles
#### GET /vehicles
- Description: List vehicles owned by current user.
- Query params: 
  - `page` (int, default 1, min 1)
  - `limit` (int, default 20, max 100)
- Validation:
  - `license_plate`: required, 2-20 chars, alphanumeric + spaces
  - `vin`: optional, exactly 17 chars if provided
  - `brand`: optional, max 50 chars
  - `model`: optional, max 50 chars
  - `production_year`: optional, integer 1980-2080
  - `car_type`: optional, max 200 chars  
- Response 200:
  ```json
  {
    "data": [
      {
        "license_plate": "WAW1234",
        "vin": "1FUJA6CK14LM94383",
        "brand": "VW",
        "model": "Passat",
        "production_year": 2010,
        "car_type": "B5 2.0 TDI",
        "created_at": "2024-10-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
  ```
- Errors: 401 Unauthorized

#### POST /vehicles
- Description: Create a new vehicle.
- Validation: same rules as POST (except license_plate not updatable)
- Payload:
  ```json
  {
    "license_plate": "WAW1234",
    "vin": "1FUJA6CK14LM94383",
    "brand": "VW",
    "model": "Passat",
    "production_year": 2010,
    "car_type": "B5 2.0 TDI"
  }
  ```
- Response 201:
  ```json
  {
    "license_plate": "WAW1234",
    "vin": "1FUJA6CK14LM94383",
    "brand": "VW",
    "model": "Passat",
    "production_year": 2010,
    "car_type": "B5 2.0 TDI",
    "created_at": "2024-10-15T10:30:00Z"
  }
  ```
- Errors:
  - 400 Bad Request (validation errors: "license_plate is required", "VIN must be exactly 17 characters")
  - 409 Conflict ("Vehicle with this license plate already exists", "Vehicle with this VIN already exists")
  - 401 Unauthorized

#### GET /vehicles/{license_plate}
- Description: Get vehicle details.
- Path params:
  - `license_plate`: URL-encoded vehicle license plate
- Response 200:
  ```json
  {
    "license_plate": "WAW1234",
    "vin": "1FUJA6CK14LM94383",
    "brand": "VW",
    "model": "Passat",
    "production_year": 2010,
    "car_type": "B5 2.0 TDI",
    "created_at": "2024-10-15T10:30:00Z"
  }
  ```
- Errors:
  - 404 Not Found ("Vehicle not found")
  - 403 Forbidden ("Access denied to this vehicle")
  - 401 Unauthorized

#### PATCH /vehicles/{license_plate}
- Description: Update vehicle.
- Payload (any subset of updatable fields):
  ```json
  {
    "vin": "1FUJA6CK14LM94383",
    "brand": "Volkswagen",
    "model": "Passat",
    "production_year": 2011,
    "car_type": "B6 2.0 TDI"
  }
  ```
- Response 200: updated vehicle object
- Errors:
  - 400 Bad Request (validation errors)
  - 404 Not Found
  - 403 Forbidden
  - 409 Conflict (VIN already exists)
  - 401 Unauthorized

#### DELETE /vehicles/{license_plate}
- Description: Delete vehicle (only if no active reservations).
- Response 204 No Content
- Errors:
  - 404 Not Found
  - 403 Forbidden
  - 409 Conflict ("Cannot delete vehicle with active reservations")
  - 401 Unauthorized

---

### 2.2 Available Slots
#### GET /reservations/available
- Description: List next available slots for a service.
- Query params:
  - `service_id` (int, required) - must exist in services table
  - `start_ts` (ISO8601 datetime, default now) - search start time
  - `end_ts` (ISO8601 datetime, optional, default +30 days) - search end time
  - `limit` (int, default 10, max 50) - max slots to return
- Validation:
  - `service_id`: must be positive integer and exist in services table
  - `start_ts`: must be valid ISO8601 datetime, cannot be in the past
  - `end_ts`: must be after `start_ts`, max 90 days from `start_ts`  
- Response 200:
  ```json
  {
    "data": [
      {
        "start_ts": "2024-10-16T09:00:00Z",
        "end_ts": "2024-10-16T09:30:00Z",
        "employee_id": "550e8400-e29b-41d4-a716-446655440000",
        "employee_name": "Mechanik1"
      },
      {
        "start_ts": "2024-10-16T09:30:00Z",
        "end_ts": "2024-10-16T10:00:00Z",
        "employee_id": "550e8400-e29b-41d4-a716-446655440000",
        "employee_name": "Mechanik1"
      }
    ]
  }
  ```
- Errors:
  - 400 Bad Request ("service_id is required", "Invalid datetime format", "from cannot be in the past")
  - 404 Not Found ("Service not found")
  - 401 Unauthorized

---

### 2.3 Reservations
#### POST /reservations
- Description: Create a reservation.
- Validation:
  - `service_id`: required, must exist in services table
  - `vehicle_license_plate`: required, must be owned by current user
  - `employee_id`: required, must exist in employees table
  - `start_ts`: required, valid ISO8601, cannot be in the past
  - `end_ts`: required, valid ISO8601, must be after start_ts
  - Time slot must be available (no overlapping reservations for employee)
  - Duration must match service duration (end_ts - start_ts = service.duration_minutes)
- Payload:
  ```json
  {
    "service_id": 1,
    "vehicle_license_plate": "WAW1234",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "start_ts": "2024-10-16T09:00:00Z",
    "end_ts": "2024-10-16T09:30:00Z"
  }
  ```
- Response 201:
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "service_id": 1,
    "service_name": "Oil Change",
    "service_duration_minutes": 30,
    "vehicle_license_plate": "WAW1234",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_name": "Mechanik1",
    "start_ts": "2024-10-16T09:00:00Z",
    "end_ts": "2024-10-16T09:30:00Z",
    "status": "New",
    "recommendation_text": "Based on your 2010 VW Passat, consider checking brake fluid and air filter replacement.",
    "created_at": "2024-10-15T14:30:00Z",
    "updated_at": "2024-10-15T14:30:00Z"
  }
  ```
- Errors:
  - 400 Bad Request ("service_id is required", "start_ts cannot be in the past", "Duration doesn't match service")
  - 404 Not Found ("Service not found", "Vehicle not found", "Employee not found")
  - 409 Conflict ("Time slot not available", "Employee already booked at this time")
  - 403 Forbidden ("Vehicle not owned by user")
  - 401 Unauthorized

#### GET /reservations
- Description: List reservations.
- Query params:
  - `page` (int, default 1, min 1)
  - `limit` (int, default 20, max 100)
  - `status` (string, optional) - filter by status: "New", "Completed", "Cancelled"
  - `from` (ISO8601, optional) - filter reservations from this date
  - `to` (ISO8601, optional) - filter reservations until this date
- Authorization:
  - Clients see only their own reservations (user_id = auth.sub)
  - Secretariat sees all reservations
- Response 200:
  ```json
  {
    "data": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "service_id": 1,
        "service_name": "Oil Change",
        "service_duration_minutes": 30,
        "vehicle_license_plate": "WAW1234",
        "employee_id": "550e8400-e29b-41d4-a716-446655440000",
        "employee_name": "Mechanik1",
        "start_ts": "2024-10-16T09:00:00Z",
        "end_ts": "2024-10-16T09:30:00Z",
        "status": "New",
        "created_at": "2024-10-15T14:30:00Z",
        "updated_at": "2024-10-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
  ```
- Errors:
  - 400 Bad Request ("Invalid status value", "Invalid date format")
  - 401 Unauthorized

#### GET /reservations/{id}
- Description: Get reservation details.
- Path params:
  - `id`: UUID of the reservation
- Response 200:
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "service_id": 1,
    "service_name": "Oil Change",
    "service_duration_minutes": 30,
    "vehicle_license_plate": "WAW1234",
    "vehicle_brand": "VW",
    "vehicle_model": "Passat",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_name": "Mechanik1",
    "start_ts": "2024-10-16T09:00:00Z",
    "end_ts": "2024-10-16T09:30:00Z",
    "status": "New",
    "recommendation_text": "Based on your 2010 VW Passat, consider checking brake fluid and air filter replacement.",
    "created_at": "2024-10-15T14:30:00Z",
    "updated_at": "2024-10-15T14:30:00Z"
  }
  ```
- Errors:
  - 404 Not Found ("Reservation not found")
  - 403 Forbidden ("Access denied to this reservation")
  - 401 Unauthorized

#### PATCH /reservations/{id}
- Description: Update reservation (change time/service/status).
- Validation:
  - `service_id`: must exist, duration must match new time range
  - `start_ts`/`end_ts`: cannot be in the past, must be available slot
  - `status`: must be valid enum value ("New", "Completed", "Cancelled")
  - Only future reservations can be modified (except status changes)
- Logic:
    - Automatic update of the `updated_at` field via database triggers when reservation are modified.
- Authorization:
  - Clients can only update their own reservations
  - Secretariat can update any reservation
- Payload (any subset of updatable fields):
  ```json
  {
    "service_id": 2,
    "start_ts": "2024-10-16T10:00:00Z",
    "end_ts": "2024-10-16T11:00:00Z",
    "status": "Cancelled"
  }
  ```
- Response 200: updated reservation object (same format as GET)
- Errors:
  - 400 Bad Request ("Cannot modify past reservation", "Invalid status transition")
  - 404 Not Found ("Reservation not found")
  - 403 Forbidden ("Access denied", "Only secretariat can mark as completed")
  - 409 Conflict ("New time slot not available")
  - 401 Unauthorized
- Note: To cancel a reservation, set `status: "Cancelled"` in the payload.

---

## 3. Validation & Business Logic

### 3.1 Validation Rules

#### Vehicle Validation
- **license_plate**: required, 2-20 characters, alphanumeric + spaces, unique per user
- **vin**: optional, exactly 17 characters if provided, unique globally
- **brand**: optional, max 50 characters
- **model**: optional, max 50 characters  
- **production_year**: optional, integer between 1900-2030
- **car_type**: optional, max 200 characters

#### Reservation Validation
- **service_id**: required, must exist in services table
- **employee_id**: required, must exist in employees table
- **vehicle_license_plate**: required, must be owned by requesting user (unless secretariat)
- **start_ts**: required, valid ISO8601, cannot be in the past
- **end_ts**: required, valid ISO8601, must be after start_ts
- **duration match**: (end_ts - start_ts) must equal service.duration_minutes
- **availability**: time slot must not overlap with existing reservations for the employee
- **employee schedule**: time slot must fall within employee's working hours
- **status transitions**: New → Completed, or New/Completed → Cancelled

#### Query Parameter Validation
- **page**: integer, min 1, default 1
- **limit**: integer, min 1, max 100, default 20
- **datetime params**: valid ISO8601 format, reasonable ranges (max 90 days for availability search)

### 3.2 Business Logic

#### Available Slots Algorithm
1. **Query employee schedules**: Find all employee_schedules within the requested time range
2. **Generate time slots**: For each employee schedule, create potential booking windows by sliding the service duration across their available hours (e.g., 8:00-16:00 with 30min service = slots at 8:00-8:30, 8:30-9:00, etc.)
3. **Filter existing reservations**: Exclude time ranges that overlap with existing reservations using DB EXCLUDE constraint
4. **Apply business rules**: Only show slots that are:
   - In the future (start_ts > now)
   - Within employee working hours
   - Not conflicting with other reservations
   - Matching exact service duration
5. **Sort and limit**: Return chronologically ordered slots, limited by query parameter

#### Reservation Creation Flow
1. **Validate input**: Check all required fields and business rules
2. **Check availability**: Verify the exact time slot is still available (atomic check)
3. **Create reservation**: Insert with status "New", auto-set user_id from JWT
4. **Generate recommendation**: Call LLM service with vehicle data (brand, model, year, current date) and store result
5. **Return response**: Include generated recommendation_text

#### Authorization Logic
- **RLS (Row Level Security)**: Database-level policies ensure users only see their own data
- **Role-based access**: JWT contains role claim ("client" or "secretariat")
- **Secretariat privileges**: Can view/modify all reservations, mark as "Completed"
- **Client restrictions**: Can only access own vehicles and reservations

#### Error Handling
- **Early validation**: Return 400 for invalid input before database operations
- **Constraint mapping**: Map DB constraint violations to appropriate HTTP codes:
  - UNIQUE violations → 409 Conflict
  - FOREIGN KEY violations → 404 Not Found
  - EXCLUDE violations → 409 Conflict ("Time slot not available")
- **Graceful degradation**: If LLM service fails, create reservation without recommendation

#### Performance Considerations
- **Pagination**: Default limit/offset on all list endpoints
- **Indexing**: Leverage DB indexes on foreign keys and timestamp ranges

## 5. Authentication and Authorization

- **Mechanism**: Token-based authentication using Supabase Auth.
- **Process**:
  - Users authenticate via `/auth/login` or `/auth/register`, receiving a bearer token.
  - Protected endpoints require the token in the `Authorization` header.
  - Database-level Row-Level Security (RLS) ensures that users access only records with matching `user_id`.
- **Additional Considerations**: Use HTTPS, rate limiting, and secure error messaging to mitigate security risks.



