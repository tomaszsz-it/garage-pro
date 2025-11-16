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
  // Use proper overlapping logic for date ranges
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
    .gte("end_ts", startTs.toISOString()) // Schedule ends after our start time
    .lte("start_ts", endTs.toISOString()); // Schedule starts before our end time

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

    // Slot generation completed for employee
  });

  // Sort slots chronologically
  timeSlots.sort((a, b) => a.start_ts.getTime() - b.start_ts.getTime());

  // 4. Get existing reservations to filter out unavailable slots
  // FIXED: Use proper overlap logic - find all reservations that overlap with query period
  const { data: existingReservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("start_ts, end_ts, employee_id")
    .lt("start_ts", endTs.toISOString()) // Reservation starts before our end time
    .gt("end_ts", startTs.toISOString()) // Reservation ends after our start time
    .neq("status", "Cancelled");

  if (reservationsError) {
    throw new DatabaseError("Failed to fetch existing reservations", reservationsError);
  }

  // Filter out slots that overlap with existing reservations
  const availableSlots = timeSlots.filter((slot) => {
    const hasConflict = existingReservations?.some((reservation) => {
      const reservationStart = new Date(reservation.start_ts);
      const reservationEnd = new Date(reservation.end_ts);

      // Check if slot overlaps with reservation for the same employee
      const sameEmployee = reservation.employee_id === slot.employee_id;
      // FIXED: Proper overlap logic - slots that touch at endpoints don't overlap
      const overlaps = slot.start_ts < reservationEnd && slot.end_ts > reservationStart;

      return sameEmployee && overlaps;
    });

    return !hasConflict;
  });

  // 5. Group slots by time and select the best available employee for each time slot
  const uniqueSlots = new Map<string, TimeSlot>();

  availableSlots.forEach((slot) => {
    const timeKey = slot.start_ts.toISOString();

    // If we don't have a slot for this time yet, or if this employee is "better"
    // (for now, just keep the first one, but this could be enhanced with employee priority)
    if (!uniqueSlots.has(timeKey)) {
      uniqueSlots.set(timeKey, slot);
    }
  });

  // Convert map to array, sort by time, and return limited results
  const uniqueSlotsArray = Array.from(uniqueSlots.values()).sort((a, b) => a.start_ts.getTime() - b.start_ts.getTime());

  // Return final result
  const result = uniqueSlotsArray.slice(0, limit).map((slot) => ({
    start_ts: slot.start_ts.toISOString(),
    end_ts: slot.end_ts.toISOString(),
    employee_id: slot.employee_id,
    employee_name: slot.employee_name,
  }));

  return result;
}
