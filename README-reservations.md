# Reservations API Documentation

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