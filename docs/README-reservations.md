# Reservations API Documentation

## GET /api/reservations

Returns a paginated list of reservations. Regular users can only see their own reservations, while users with the secretariat role can see all reservations.

### Authentication

- Requires a valid authentication token
- Token must be provided in the Authorization header

### Query Parameters

| Parameter | Type    | Required | Default | Description                                  |
|-----------|---------|----------|---------|----------------------------------------------|
| page      | integer | No       | 1       | Page number (min: 1)                         |
| limit     | integer | No       | 20      | Items per page (max: 100)                    |

### Response

#### 200 OK

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "service_id": 1,
      "service_name": "Oil Change",
      "service_duration_minutes": 30,
      "vehicle_license_plate": "WAW1234",
      "employee_id": "550e8400-e29b-41d4-a716-446655440000",
      "employee_name": "John Doe",
      "start_ts": "2025-10-23T09:00:00Z",
      "end_ts": "2025-10-23T09:30:00Z",
      "status": "New",
      "created_at": "2025-10-22T15:30:00Z",
      "updated_at": "2025-10-22T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

#### Error Responses

- 400 Bad Request
  - Invalid query parameters

```json
{
  "error": "Bad Request",
  "message": "Invalid query parameters",
  "details": [
    {
      "field": "page",
      "message": "page must be greater than 0"
    }
  ]
}
```

- 401 Unauthorized
  - Missing or invalid authentication token

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

- 500 Internal Server Error
  - Unexpected server error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

### Example Usage

```bash
# Get first page of reservations (default 20 per page)
curl -X GET 'https://api.example.com/api/reservations' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Get second page with 10 items per page
curl -X GET 'https://api.example.com/api/reservations?page=2&limit=10' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Notes

- Results are sorted by start_ts in ascending order
- Regular users can only see their own reservations
- Users with secretariat role can see all reservations
- All times are in UTC (ISO8601 format)

## POST /api/reservations

Creates a new reservation for a service.

### Authentication

- Requires a valid authentication token
- Token must be provided in the Authorization header

### Request Body

```json
{
  "service_id": 1,
  "vehicle_license_plate": "ABC123",
  "employee_id": "uuid",
  "start_ts": "2025-10-23T09:00:00Z",
  "end_ts": "2025-10-23T09:30:00Z"
}
```

| Field                | Type    | Required | Description                                      |
|---------------------|---------|----------|--------------------------------------------------|
| service_id          | integer | Yes      | ID of the service to reserve                     |
| vehicle_license_plate| string  | Yes      | License plate of the vehicle (must be owned by user) |
| employee_id         | string  | Yes      | UUID of the employee to perform the service      |
| start_ts            | string  | Yes      | Start time of the reservation (ISO8601)          |
| end_ts              | string  | Yes      | End time of the reservation (ISO8601)            |

### Response

#### 201 Created

```json
{
  "id": "uuid",
  "service_id": 1,
  "service_name": "Oil Change",
  "service_duration_minutes": 30,
  "vehicle_license_plate": "ABC123",
  "employee_id": "uuid",
  "employee_name": "John Doe",
  "start_ts": "2025-10-23T09:00:00Z",
  "end_ts": "2025-10-23T09:30:00Z",
  "status": "New",
  "created_at": "2025-10-22T15:30:00Z",
  "updated_at": "2025-10-22T15:30:00Z"
}
```

#### Error Responses

- 400 Bad Request
  - Missing required fields
  - Invalid field formats
  - Time slot duration doesn't match service duration
  - Start time in the past
  - End time before start time

```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "start_ts",
      "message": "start_ts cannot be in the past"
    }
  ]
}
```

- 401 Unauthorized
  - Missing or invalid authentication token

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

- 403 Forbidden
  - Vehicle not owned by user

```json
{
  "error": "Vehicle not owned by user",
  "details": {
    "license_plate": "ABC123"
  }
}
```

- 404 Not Found
  - Service or employee not found

```json
{
  "error": "Service not found",
  "details": {
    "service_id": 1
  }
}
```

- 409 Conflict
  - Time slot not available (conflicts with another reservation)
  - Employee not available (outside schedule)

```json
{
  "error": "Time slot not available",
  "details": {
    "conflicts": 1
  }
}
```

- 500 Internal Server Error
  - Unexpected server error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

### Example Usage

```bash
curl -X POST 'https://api.example.com/api/reservations' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "service_id": 1,
    "vehicle_license_plate": "ABC123",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "start_ts": "2025-10-23T09:00:00Z",
    "end_ts": "2025-10-23T09:30:00Z"
  }'
```

### Notes

- All times must be in UTC (ISO8601 format)
- The time slot duration must exactly match the service duration
- Vehicle ownership is verified before creating the reservation
- Employee availability is checked against their schedule
- Reservation status is automatically set to "New"
- A service recommendation is automatically generated

## GET /reservations/available

Returns a list of available reservation slots for a specific service.

### Authentication

- Requires a valid authentication token
- Token must be provided in the Authorization header

### Query Parameters

| Parameter  | Type    | Required | Default    | Description                                      |
|------------|---------|----------|------------|--------------------------------------------------|
| service_id | integer | Yes      | -          | ID of the service to check availability for      |
| start_ts   | string  | No       | now()      | Start of the time range (ISO8601)               |
| end_ts     | string  | No       | +30 days   | End of the time range (ISO8601)                 |
| limit      | integer | No       | 32         | Maximum number of slots to return (max 200)      |

### Response

#### 200 OK

```json
{
  "data": [
    {
      "start_ts": "2025-10-23T09:00:00Z",
      "end_ts": "2025-10-23T09:30:00Z",
      "employee_id": "uuid",
      "employee_name": "John Doe"
    }
  ]
}
```

#### Error Responses

- 400 Bad Request
  - Invalid service_id
  - Invalid date format
  - start_ts in the past
  - end_ts before start_ts
  - end_ts more than 90 days after start_ts
  - limit outside valid range (1-200)

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "path": ["service_id"],
      "message": "Service ID must be a positive integer"
    }
  ]
}
```

- 401 Unauthorized
  - Missing or invalid authentication token

```json
{
  "error": "Unauthorized"
}
```

- 404 Not Found
  - Service with provided ID does not exist

```json
{
  "error": "Service not found"
}
```

- 500 Internal Server Error
  - Unexpected server error

```json
{
  "error": "Internal server error"
}
```

### Example Usage

```bash
# Get available slots for service ID 1
curl -X GET 'https://api.example.com/reservations/available?service_id=1' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Get available slots for next week
curl -X GET 'https://api.example.com/reservations/available?service_id=1&start_ts=2025-10-23T00:00:00Z&end_ts=2025-10-30T00:00:00Z' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Notes

- Time slots are generated based on service duration
- Slots that overlap with existing reservations are excluded
- Results are sorted chronologically
- Response is not cached (Cache-Control: no-cache)
- All times are in UTC (ISO8601 format)

## GET /api/reservations/{id}

Retrieves detailed information about a specific reservation including service details, employee information, and vehicle data.

### Authentication

- Requires a valid authentication token
- Token must be provided in the Authorization header
- Users can only access their own reservations unless they have secretariat role

### Path Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| id        | string | Yes      | UUID of the reservation        |

### Response

#### 200 OK

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
  "recommendation_text": "Based on your 2010 VW Passat...",
  "created_at": "2024-10-15T14:30:00Z",
  "updated_at": "2024-10-15T14:30:00Z"
}
```

#### Error Responses

- 400 Bad Request
  - Invalid UUID format

```json
{
  "error": "Bad Request",
  "message": "Invalid reservation ID",
  "details": [
    {
      "field": "id",
      "message": "Reservation ID must be a valid UUID"
    }
  ]
}
```

- 401 Unauthorized
  - Missing or invalid authentication token

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

- 403 Forbidden
  - Access denied to this reservation (user can only access their own reservations)

```json
{
  "error": "Access denied to this reservation"
}
```

- 404 Not Found
  - Reservation not found

```json
{
  "error": "Reservation not found",
  "details": {
    "id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

- 500 Internal Server Error
  - Unexpected server error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

### Example Usage

```bash
# Get reservation by ID
curl -X GET 'https://api.example.com/api/reservations/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Notes

- Returns detailed reservation information with joined data from services, employees, and vehicles tables
- Regular users can only access their own reservations
- Users with secretariat role can access all reservations
- All times are in UTC (ISO8601 format)

## PATCH /api/reservations/{id}

Updates an existing reservation. Allows changing service, vehicle, time slot, or status with comprehensive business rule validation.

### Authentication

- Requires a valid authentication token
- Token must be provided in the Authorization header
- Users can only modify their own reservations unless they have secretariat role

### Path Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| id        | string | Yes      | UUID of the reservation        |

### Request Body

All fields are optional - provide only the fields you want to update:

```json
{
  "service_id": 2,
  "vehicle_license_plate": "NEW123",
  "start_ts": "2024-10-16T10:00:00Z",
  "end_ts": "2024-10-16T11:00:00Z",
  "status": "Cancelled"
}
```

| Field                 | Type    | Required | Description                                      |
|----------------------|---------|----------|--------------------------------------------------|
| service_id           | integer | No       | ID of the new service                            |
| vehicle_license_plate| string  | No       | License plate of the new vehicle (must be owned by user) |
| start_ts             | string  | No       | New start time (ISO8601) - must provide with end_ts |
| end_ts               | string  | No       | New end time (ISO8601) - must provide with start_ts |
| status               | string  | No       | New status: "New", "Completed", "Cancelled"     |

### Business Rules

- **Past reservations**: Only status changes are allowed for past reservations
- **Status transitions**: Only "New" status can be changed to "Cancelled" or "Completed"
- **Completed status**: Only secretariat can mark reservations as "Completed"
- **Time changes**: Both start_ts and end_ts must be provided together
- **Service duration**: New time range must match the service duration
- **Time conflicts**: New time slot must be available (no conflicts with other reservations)
- **Employee schedule**: New time must be within employee's working hours
- **Vehicle ownership**: New vehicle must be owned by the user

### Response

#### 200 OK

Returns the updated reservation with the same format as GET /api/reservations/{id}

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "service_id": 2,
  "service_name": "Brake Inspection",
  "service_duration_minutes": 60,
  "vehicle_license_plate": "NEW123",
  "vehicle_brand": "BMW",
  "vehicle_model": "X5",
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_name": "Mechanik1",
  "start_ts": "2024-10-16T10:00:00Z",
  "end_ts": "2024-10-16T11:00:00Z",
  "status": "New",
  "recommendation_text": "Updated recommendation...",
  "created_at": "2024-10-15T14:30:00Z",
  "updated_at": "2024-10-16T08:15:00Z"
}
```

#### Error Responses

- 400 Bad Request
  - Invalid UUID format
  - Validation errors
  - Business rule violations

```json
{
  "error": "Cannot modify past reservation except status",
  "details": {
    "reservation_start": "2024-10-15T09:00:00Z",
    "current_time": "2024-10-16T10:00:00Z"
  }
}
```

- 401 Unauthorized
  - Missing or invalid authentication token

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

- 403 Forbidden
  - Access denied to this reservation
  - Insufficient permissions for status change

```json
{
  "error": "Only secretariat can mark reservation as completed",
  "details": {
    "user_role": "user",
    "requested_status": "Completed"
  }
}
```

- 404 Not Found
  - Reservation, service, or vehicle not found

```json
{
  "error": "Reservation not found",
  "details": {
    "id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

- 409 Conflict
  - Time slot not available
  - Scheduling conflicts

```json
{
  "error": "New time slot not available",
  "details": {
    "conflicts": 2,
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "requested_start": "2024-10-16T10:00:00Z",
    "requested_end": "2024-10-16T11:00:00Z"
  }
}
```

- 500 Internal Server Error
  - Unexpected server error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

### Example Usage

```bash
# Cancel a reservation
curl -X PATCH 'https://api.example.com/api/reservations/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "Cancelled"
  }'

# Change service and time
curl -X PATCH 'https://api.example.com/api/reservations/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "service_id": 2,
    "start_ts": "2024-10-16T14:00:00Z",
    "end_ts": "2024-10-16T15:00:00Z"
  }'

# Change vehicle
curl -X PATCH 'https://api.example.com/api/reservations/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "vehicle_license_plate": "NEW123"
  }'
```

### Notes

- All times must be in UTC (ISO8601 format)
- At least one field must be provided for update
- Time changes require both start_ts and end_ts to be provided together
- Service duration validation ensures new time range matches service requirements
- Comprehensive conflict checking prevents double-booking
- Status changes follow strict business rules for data integrity
- Vehicle ownership is verified for security