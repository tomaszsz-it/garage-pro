# Reservations API Documentation

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
