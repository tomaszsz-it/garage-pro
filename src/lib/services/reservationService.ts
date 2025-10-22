import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReservationCreateDto, ReservationDto } from "../../types";
import { DatabaseError } from "../errors/database.error";

export interface ReservationService {
  createReservation(dto: ReservationCreateDto, userId: string): Promise<ReservationDto>;
}

export function createReservationService(supabase: SupabaseClient): ReservationService {
  return {
    async createReservation(dto: ReservationCreateDto, userId: string): Promise<ReservationDto> {
      // 1. Verify vehicle ownership
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .select("id, brand, model, production_year")
        .eq("license_plate", dto.vehicle_license_plate)
        .eq("user_id", userId)
        .single();

      //  if (vehicleError || !vehicle) {
      //    throw new DatabaseError("Vehicle not owned by user", 403, "VEHICLE_NOT_OWNED", {
      //      license_plate: dto.vehicle_license_plate,
      //    });
      //  }

      // 2. Verify service exists and get duration
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("service_id, name, duration_minutes")
        .eq("service_id", dto.service_id)
        .single();

      console.log("Service data:", JSON.stringify(service, null, 2));

      if (!service) {
        throw new DatabaseError("Service not serve by our garage", 404, "SERVICE_NOT_FOUND", {
          service_id: dto.service_id,
        });
      }

      // 3. Verify employee exists
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("employee_id, name")
        .eq("employee_id", dto.employee_id)
        .single();

      if (employeeError || !employee) {
        throw new DatabaseError("Employee not found", 404, "EMPLOYEE_NOT_FOUND", { employee_id: dto.employee_id });
      }

      // 4. Verify time slot duration matches service duration
      const start = new Date(dto.start_ts);
      const end = new Date(dto.end_ts);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

      if (durationMinutes !== service.duration_minutes) {
        throw new DatabaseError("Time slot duration does not match service duration", 400, "INVALID_DURATION", {
          expected: service.duration_minutes,
          actual: durationMinutes,
          start_ts: dto.start_ts,
          end_ts: dto.end_ts,
        });
      }

      // 5. Check for time slot availability (no conflicts)
      const { data: conflicts, error: conflictsError } = await supabase
        .from("reservations")
        .select("id")
        .eq("employee_id", dto.employee_id)
        .or(`start_ts.lte.${dto.end_ts},end_ts.gte.${dto.start_ts}`)
        .not("status", "eq", "Cancelled");

      if (conflictsError) {
        throw new DatabaseError("Error checking time slot availability", 500, "AVAILABILITY_CHECK_ERROR");
      }

      if (conflicts && conflicts.length > 0) {
        throw new DatabaseError("Time slot not available", 409, "TIME_SLOT_CONFLICT", { conflicts: conflicts.length });
      }

      // 6. Check employee schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from("employee_schedules")
        .select("id")
        .eq("employee_id", dto.employee_id)
        .gte("start_ts", start.toISOString().split("T")[0])
        .lte("end_ts", end.toISOString().split("T")[0])
        .single();

      if (scheduleError || !schedule) {
        throw new DatabaseError("Employee not available at this time (outside schedule)", 409, "OUTSIDE_SCHEDULE", {
          employee_id: dto.employee_id,
        });
      }

      // TODO: Implement LLM service integration for generating personalized recommendations
      // The recommendation should be based on:
      // - Vehicle details (brand, model, year)
      // - Current service being performed
      // - Service history (if available)
      // For now, using a default recommendation text
      const recommendationText = `Consider checking other maintenance items during your ${service.name} service for your ${vehicle.production_year} ${vehicle.brand} ${vehicle.model}. Our mechanics can provide a detailed inspection.`;

      // 7. Create reservation
      const { data: reservation, error: insertError } = await supabase
        .from("reservations")
        .insert({
          service_id: dto.service_id,
          vehicle_license_plate: dto.vehicle_license_plate,
          employee_id: dto.employee_id,
          start_ts: dto.start_ts,
          end_ts: dto.end_ts,
          status: "New",
          created_by: userId,
          recommendation_text: recommendationText,
        })
        .select(
          `
          id,
          service_id,
          vehicle_license_plate,
          employee_id,
          start_ts,
          end_ts,
          status,
          created_at,
          updated_at,
          services (
            name,
            duration_minutes
          ),
          employees (
            name
          )
        `
        )
        .single();

      if (insertError || !reservation) {
        throw new DatabaseError("Error creating reservation", 500, "RESERVATION_CREATE_ERROR");
      }

      // 8. Return formatted DTO
      return {
        id: reservation.id,
        service_id: reservation.service_id,
        service_name: reservation.services.name,
        service_duration_minutes: reservation.services.duration_minutes,
        vehicle_license_plate: reservation.vehicle_license_plate,
        employee_id: reservation.employee_id,
        employee_name: reservation.employees.name,
        start_ts: reservation.start_ts,
        end_ts: reservation.end_ts,
        status: reservation.status,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
      };
    },
  };
}
