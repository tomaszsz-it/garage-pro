import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "../errors/database.error";
import type { AvailableReservationDto, AvailableReservationsQueryParams } from "../../types";

interface TimeSlot {
  start_ts: Date;
  end_ts: Date;
  employee_id: string;
  employee_name: string;
}

/**
 * Get available reservation slots for a given service
 * @param params Query parameters for finding available slots
 * @param supabase Supabase client instance
 * @returns Array of available reservation slots
 * @throws DatabaseError if service not found or database error occurs
 */
export async function getAvailableReservations(
  params: AvailableReservationsQueryParams,
  supabase: SupabaseClient
): Promise<AvailableReservationDto[]> {
  // Set default values for optional parameters
  const startTs = params.start_ts ? new Date(params.start_ts) : new Date();
  const endTs = params.end_ts ? new Date(params.end_ts) : new Date(startTs.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days
  const limit = params.limit ?? 32;

  // 1. Validate service exists and get duration
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("service_id", params.service_id)
    .single();

  if (serviceError || !service) {
    throw new DatabaseError("Service not found", serviceError);
  }

  // 2. Get employee schedules with employee names
  const { data: schedules, error: schedulesError } = await supabase
    .from("employee_schedules")
    .select(
      `
      start_ts,
      end_ts,
      employee_id,
      employees (
        name
      )
    `
    )
    .gte("start_ts", startTs.toISOString())
    .lte("end_ts", endTs.toISOString());

  if (schedulesError) {
    throw new DatabaseError("Failed to fetch employee schedules", schedulesError);
  }

  // 3. Generate time slots for each schedule
  const timeSlots: TimeSlot[] = [];
  const durationMs = service.duration_minutes * 60 * 1000;

  schedules?.forEach((schedule) => {
    const scheduleStart = new Date(schedule.start_ts);
    const scheduleEnd = new Date(schedule.end_ts);

    // Generate slots within the schedule
    let slotStart = new Date(Math.max(scheduleStart.getTime(), startTs.getTime()));

    while (slotStart.getTime() + durationMs <= scheduleEnd.getTime()) {
      timeSlots.push({
        start_ts: slotStart,
        end_ts: new Date(slotStart.getTime() + durationMs),
        employee_id: schedule.employee_id,
        employee_name: schedule.employees?.name || "Unknown",
      });

      // Move to next slot
      slotStart = new Date(slotStart.getTime() + durationMs);
    }
  });

  // Sort slots chronologically
  timeSlots.sort((a, b) => a.start_ts.getTime() - b.start_ts.getTime());

  // 4. Get existing reservations to filter out unavailable slots
  const { data: existingReservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("start_ts, end_ts, employee_id")
    .gte("start_ts", startTs.toISOString())
    .lte("end_ts", endTs.toISOString())
    .neq("status", "Cancelled");

  if (reservationsError) {
    throw new DatabaseError("Failed to fetch existing reservations", reservationsError);
  }

  // Filter out slots that overlap with existing reservations
  const availableSlots = timeSlots.filter((slot) => {
    return !existingReservations?.some((reservation) => {
      const reservationStart = new Date(reservation.start_ts);
      const reservationEnd = new Date(reservation.end_ts);

      return (
        reservation.employee_id === slot.employee_id &&
        !(slot.end_ts <= reservationStart || slot.start_ts >= reservationEnd)
      );
    });
  });

  // 5. Map to DTOs and return limited results
  return availableSlots.slice(0, limit).map((slot) => ({
    start_ts: slot.start_ts.toISOString(),
    end_ts: slot.end_ts.toISOString(),
    employee_id: slot.employee_id,
    employee_name: slot.employee_name,
  }));
}
