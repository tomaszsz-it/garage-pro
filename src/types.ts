// src/types.ts
import type { Database } from "./db/database.types";

// ------------------------------------------------------------------------------------------------
// Aliases for base database types extracted from the Database model definitions
// ------------------------------------------------------------------------------------------------
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];
export type VehicleUpdate = Database["public"]["Tables"]["vehicles"]["Update"];
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
export type ReservationInsert = Database["public"]["Tables"]["reservations"]["Insert"];
export type ReservationUpdate = Database["public"]["Tables"]["reservations"]["Update"];
export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ReservationStatus = Database["public"]["Enums"]["reservation_status"];

// ------------------------------------------------------------------------------------------------
// 1. Vehicle DTO
//    Represents a vehicle as returned by the API endpoints (GET /vehicles, GET /vehicles/{license_plate})
//    Excludes internal user_id field for security
// ------------------------------------------------------------------------------------------------
export type VehicleDto = Omit<Vehicle, "user_id">;

// ------------------------------------------------------------------------------------------------
// 2. Vehicle Create DTO
//    Used in the POST /vehicles endpoint to create a new vehicle.
//    Validation rules:
//      - license_plate: required, 2-20 characters, alphanumeric + spaces
//      - vin: optional, exactly 17 characters if provided
//      - brand: optional, max 50 characters
//      - model: optional, max 50 characters
//      - production_year: optional, integer between 1900-2030
//      - car_type: optional, max 200 characters
// ------------------------------------------------------------------------------------------------
export type VehicleCreateDto = Omit<VehicleInsert, "user_id" | "created_at">;

// ------------------------------------------------------------------------------------------------
// 3. Vehicle Update DTO
//    Used in the PATCH /vehicles/{license_plate} endpoint to update existing vehicles.
//    Excludes license_plate (immutable), user_id, and created_at fields
// ------------------------------------------------------------------------------------------------
export type VehicleUpdateDto = Omit<VehicleUpdate, "license_plate" | "user_id" | "created_at">;

// ------------------------------------------------------------------------------------------------
// 4. Pagination DTO
//    Contains pagination parameters used in query strings and list responses
// ------------------------------------------------------------------------------------------------
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

// ------------------------------------------------------------------------------------------------
// 5. Available Slot DTO
//    Represents an available time slot for booking a service (GET /reservations/available).
//    Combines data from employee_schedules and employees tables
// ------------------------------------------------------------------------------------------------
export interface AvailableSlotDto {
  start_ts: string;
  end_ts: string;
  employee_id: string;
  employee_name: string;
}

// ------------------------------------------------------------------------------------------------
// 6. Reservation Create DTO
//    Used in the POST /reservations endpoint to create a new reservation.
//    Validation rules:
//      - service_id: required, must exist in services table
//      - vehicle_license_plate: required, must be owned by current user
//      - employee_id: required, must exist in employees table
//      - start_ts: required, valid ISO8601, cannot be in the past
//      - end_ts: required, valid ISO8601, must be after start_ts
//      - Duration must match service duration (end_ts - start_ts = service.duration_minutes)
// ------------------------------------------------------------------------------------------------
export type ReservationCreateDto = Pick<
  ReservationInsert,
  "service_id" | "vehicle_license_plate" | "employee_id" | "start_ts" | "end_ts"
>;

// ------------------------------------------------------------------------------------------------
// 7. Reservation DTO
//    Represents a reservation as returned by the GET /reservations endpoint.
//    Includes joined data from services and employees tables, excludes internal fields
// ------------------------------------------------------------------------------------------------
export type ReservationDto = Omit<Reservation, "created_by" | "recommendation_text"> & {
  service_name: string;
  service_duration_minutes: number;
  employee_name: string;
};

// ------------------------------------------------------------------------------------------------
// 8. Reservation Detail DTO
//    Represents detailed reservation information as returned by the GET /reservations/{id} endpoint.
//    Includes extended joined data from services, employees, and vehicles tables
// ------------------------------------------------------------------------------------------------
export type ReservationDetailDto = Omit<Reservation, "created_by"> & {
  service_name: string;
  service_duration_minutes: number;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  employee_name: string;
};

// ------------------------------------------------------------------------------------------------
// 9. Reservation Update DTO
//    Used in the PATCH /reservations/{id} endpoint to update existing reservations.
//    Validation rules:
//      - service_id: must exist, duration must match new time range
//      - start_ts/end_ts: cannot be in the past, must be available slot
//      - status: must be valid enum value ("New", "Cancelled", "Done")
//      - Only future reservations can be modified (except status changes)
// ------------------------------------------------------------------------------------------------
export type ReservationUpdateDto = Partial<Pick<ReservationUpdate, "service_id" | "start_ts" | "end_ts" | "status">>;

// ------------------------------------------------------------------------------------------------
// 10. Vehicles List Response DTO
//     Combines an array of vehicles with pagination metadata (GET /vehicles)
// ------------------------------------------------------------------------------------------------
export interface VehiclesListResponseDto {
  data: VehicleDto[];
  pagination: PaginationDto & {
    total: number;
  };
}

// ------------------------------------------------------------------------------------------------
// 11. Reservations List Response DTO
//     Combines an array of reservations with pagination metadata (GET /reservations)
// ------------------------------------------------------------------------------------------------
export interface ReservationsListResponseDto {
  data: ReservationDto[];
  pagination: PaginationDto & {
    total: number;
  };
}

// ------------------------------------------------------------------------------------------------
// 12. Available Slots Response DTO
//     Represents the response from GET /reservations/available endpoint
// ------------------------------------------------------------------------------------------------
export interface AvailableSlotsResponseDto {
  data: AvailableSlotDto[];
}

// ------------------------------------------------------------------------------------------------
// 13. Query Parameters DTOs
//     Type definitions for query parameters used in various endpoints
// ------------------------------------------------------------------------------------------------
export interface VehiclesQueryParams extends PaginationDto {}

export interface ReservationsQueryParams extends PaginationDto {
  status?: ReservationStatus;
  from?: string; // ISO8601 datetime
  to?: string; // ISO8601 datetime
}

export interface AvailableSlotsQueryParams {
  service_id: number;
  from?: string; // ISO8601 datetime, default now
  to?: string; // ISO8601 datetime, default +30 days
  limit?: number; // default 10, max 50
}
