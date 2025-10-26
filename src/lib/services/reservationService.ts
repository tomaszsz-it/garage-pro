import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ReservationCreateDto,
  ReservationDto,
  ReservationStatus,
  ReservationsListResponseDto,
  ReservationsQueryParams,
} from "../../types";
import { DatabaseError } from "../errors/database.error";

export interface ReservationService {
  createReservation(dto: ReservationCreateDto, userId: string): Promise<ReservationDto>;
  getReservations(
    params: ReservationsQueryParams,
    user: { id: string; role?: string }
  ): Promise<ReservationsListResponseDto>;
}

interface ServiceData {
  name: string;
  duration_minutes: number;
}

interface EmployeeData {
  name: string;
}

interface ReservationWithRelations {
  id: string;
  user_id: string;
  service_id: number;
  vehicle_license_plate: string;
  employee_id: string;
  start_ts: string;
  end_ts: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
  services: ServiceData;
  employees: EmployeeData;
}

export function createReservationService(supabase: SupabaseClient): ReservationService {
  return {
    async getReservations(
      params: ReservationsQueryParams,
      user: { id: string; role?: string }
    ): Promise<ReservationsListResponseDto> {
      // Initialize query builder
      let query = supabase.from("reservations").select(`
      id,
      user_id,
      service_id,
      vehicle_license_plate,
      employee_id,
      start_ts,
      end_ts,
      status,
      created_at,
      updated_at,
      services!inner (
        name,
        duration_minutes
      ),
      employees!inner (
        name
      )
    `);

      // Apply role-based filtering
      // If not secretariat, only show user's own reservations
      if (user.role !== "secretariat") {
        query = query.eq("user_id", user.id);
      }

      // Get total count before pagination
      // Using a simpler approach to count total records
      // First, get all IDs without pagination to count them
      let countQuery = supabase.from("reservations").select("id");

      // Apply the same user filtering
      if (user.role !== "secretariat") {
        countQuery = countQuery.eq("user_id", user.id);
      }

      // Get the data to count
      const { data: countData, error: countError } = await countQuery;

      // Count the records
      const total = countData?.length || 0;

      if (countError) {
        throw new DatabaseError("Error counting reservations");
      }

      // Apply sorting and pagination
      const { data: reservations, error } = await query
        .order("start_ts", { ascending: true })
        .range((params.page - 1) * params.limit, params.page * params.limit - 1);

      if (error) {
        throw new DatabaseError("Error fetching reservations");
      }

      if (!reservations) {
        return {
          data: [],
          pagination: {
            page: params.page,
            limit: params.limit,
            total: 0,
          },
        };
      }

      // Map database results to DTOs
      const typedReservations = reservations as unknown as ReservationWithRelations[];

      const reservationDtos: ReservationDto[] = typedReservations.map((res) => ({
        id: res.id,
        user_id: res.user_id,
        service_id: res.service_id,
        service_name: res.services.name,
        service_duration_minutes: res.services.duration_minutes,
        vehicle_license_plate: res.vehicle_license_plate,
        employee_id: res.employee_id,
        employee_name: res.employees.name,
        start_ts: res.start_ts,
        end_ts: res.end_ts,
        status: res.status,
        created_at: res.created_at,
        updated_at: res.updated_at,
      }));

      // Return formatted response with pagination
      return {
        data: reservationDtos,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
        },
      };
    },

    async createReservation(dto: ReservationCreateDto, userId: string): Promise<ReservationDto> {
      // 1. Verify vehicle ownership
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("user_id, brand, model, production_year")
        .eq("license_plate", dto.vehicle_license_plate)
        .eq("user_id", userId)
        .single();

      if (!vehicle) {
        throw new DatabaseError("Vehicle not owned by user", {
          license_plate: dto.vehicle_license_plate,
        });
      }

      // 2. Verify service exists and get duration
      const { data: service } = await supabase
        .from("services")
        .select("service_id, name, duration_minutes")
        .eq("service_id", dto.service_id)
        .single();

      if (!service) {
        throw new DatabaseError("Service not found in the garage", { service_id: dto.service_id });
      }

      // 3. Verify employee exists
      const { data: employee } = await supabase.from("employees").select("id, name").eq("id", dto.employee_id).single();

      if (!employee) {
        throw new DatabaseError("Employee not found", { employee_id: dto.employee_id });
      }

      // 4. Verify time slot duration matches service duration
      const start = new Date(dto.start_ts);
      const end = new Date(dto.end_ts);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

      if (durationMinutes !== service.duration_minutes) {
        throw new DatabaseError("Time slot duration does not match service duration", {
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
        throw new DatabaseError("Error checking time slot availability");
      }

      if (conflicts && conflicts.length > 0) {
        throw new DatabaseError("Time slot not available", { conflicts: conflicts.length });
      }

      // 6. Check employee schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from("employee_schedules")
        .select("employee_id, start_ts, end_ts")
        .eq("employee_id", dto.employee_id)
        .lte("start_ts", dto.start_ts)
        .gte("end_ts", dto.end_ts);

      if (scheduleError) {
        throw new DatabaseError("Error checking employee schedule", {
          employee_id: dto.employee_id,
        });
      }

      if (!schedule) {
        throw new DatabaseError("Employee not available at this time (outside schedule)", {
          employee_id: dto.employee_id,
        });
      }

      // TODO: Implement LLM service integration for generating personalized recommendations
      // The recommendation should be based on:
      // - Vehicle details (brand, model, year)
      // - Current service being performed
      // - Service history (if available)
      // For now, using a default recommendation text
      const recommendationText = `Consider checking other maintenance items during your ${service.name} service${
        vehicle ? ` for your ${vehicle.production_year} ${vehicle.brand} ${vehicle.model}` : ""
      }. Our mechanics can provide a detailed inspection.`;

      // 7. Create reservation
      const { data: reservation, error: insertError } = await supabase
        .from("reservations")
        .insert({
          service_id: dto.service_id,
          vehicle_license_plate: dto.vehicle_license_plate,
          employee_id: dto.employee_id,
          start_ts: dto.start_ts,
          end_ts: dto.end_ts,
          status: "New" as const,
          created_by: userId,
          user_id: userId,
          recommendation_text: recommendationText,
        })
        .select(
          `
          id,
          user_id,
          service_id,
          vehicle_license_plate,
          employee_id,
          start_ts,
          end_ts,
          status,
          created_at,
          updated_at,
          services!inner (
            name,
            duration_minutes
          ),
          employees!inner (
            name
          )
        `
        )
        .single();

      if (insertError || !reservation) {
        throw new DatabaseError("Error creating reservation");
      }

      const typedReservation = reservation as unknown as ReservationWithRelations;

      // 8. Return formatted DTO
      return {
        id: typedReservation.id,
        user_id: typedReservation.user_id,
        service_id: typedReservation.service_id,
        service_name: typedReservation.services.name,
        service_duration_minutes: typedReservation.services.duration_minutes,
        vehicle_license_plate: typedReservation.vehicle_license_plate,
        employee_id: typedReservation.employee_id,
        employee_name: typedReservation.employees.name,
        start_ts: typedReservation.start_ts,
        end_ts: typedReservation.end_ts,
        status: typedReservation.status,
        created_at: typedReservation.created_at,
        updated_at: typedReservation.updated_at,
      };
    },
  };
}
