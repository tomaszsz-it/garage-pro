import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ReservationCreateDto,
  ReservationDto,
  ReservationDetailDto,
  ReservationUpdateDto,
  ReservationStatus,
  ReservationsListResponseDto,
  ReservationsQueryParams,
} from "../../types";
import { DatabaseError } from "../errors/database.error";
import { OpenRouterService } from "../openrouter.service";

export interface ReservationService {
  createReservation(dto: ReservationCreateDto, userId: string): Promise<ReservationDto>;
  getReservations(
    params: ReservationsQueryParams,
    user: { id: string; role?: string }
  ): Promise<ReservationsListResponseDto>;
  getReservationById(id: string, user: { id: string; role?: string }): Promise<ReservationDetailDto>;
  updateReservation(
    id: string,
    data: ReservationUpdateDto,
    user: { id: string; role?: string }
  ): Promise<ReservationDetailDto>;
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
  recommendation_text: string;
  services: ServiceData;
  employees: EmployeeData;
}

interface VehicleData {
  brand: string | null;
  model: string | null;
}

interface ReservationWithDetailedRelations extends ReservationWithRelations {
  vehicles: VehicleData;
}

/**
 * Generates a personalized maintenance recommendation using LLM
 *
 * @param openRouter OpenRouter service instance
 * @param vehicleInfo Vehicle information for personalized recommendation
 * @param serviceName Service being performed
 * @returns Promise with the generated recommendation text
 */
async function generateRecommendation(
  openRouter: OpenRouterService | undefined,
  vehicleInfo: { brand: string; model: string; production_year: number } | null,
  serviceName: string
): Promise<string> {
  // If OpenRouter service is not available, return a default recommendation
  if (!openRouter) {
    return `Podczas wizyty w serwisie rozważ także konserwację innych elementów pojazdu${vehicleInfo ? ` w Twoim ${vehicleInfo.brand} ${vehicleInfo.model} z ${vehicleInfo.production_year} roku` : ""} - np. sprawdzenie filtrów, płynów eksploatacyjnych czy stanu opon. Nasi mechanicy chętnie doradzą w kwestiach konserwacji.`;
  }

  try {
    // Create a prompt for the LLM
    const vehicleDescription = vehicleInfo
      ? `${vehicleInfo.brand} ${vehicleInfo.model} z ${vehicleInfo.production_year} roku`
      : "pojazd";

    // Set system message to guide the LLM response
    openRouter.setSystemMessage(
      "Jesteś doświadczonym mechanikiem samochodowym z 15-letnim stażem. Udzielasz konkretnych, praktycznych rekomendacji konserwacyjnych. " +
        "ZASADY: " +
        "1. Używaj poprawnej polszczyzny " +
        "2. Sugeruj TYLKO sprawdzone elementy pojazdu RÓŻNE od aktualnie serwisowanego " +
        "3. Opieraj się na rzeczywistych intervalach konserwacyjnych i zależnościach technicznych " +
        "4. Unikaj spekulacji i niepewnych stwierdzeń " +
        "5. Maksymalnie 2 zdania, bez wstępów i zakończeń " +
        "6. Podawaj konkretne interwały (km/miesiące) dla rekomendowanych czynności " +
        "7. NIE wspominaj o aktualnie wykonywanej usłudze - skup się na innych elementach"
    );

    // Set the user message with details about the vehicle and service
    const userMessage = `Dla pojazdu ${vehicleDescription}, gdy klient będzie w serwisie na usłudze "${serviceName}" - jakie INNE elementy pojazdu warto mu przypomnieć do konserwacji? Podaj konkretne rekomendacje z intervalami, które NIE dotyczą aktualnie wykonywanej usługi.`;

    // Get recommendation from LLM
    const recommendation = await openRouter.sendChatMessage<string>(userMessage);
    return recommendation;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("LLM recommendation failed:", error);
    // Fallback to default recommendation if LLM fails
    return `Podczas wizyty w serwisie rozważ także konserwację innych elementów pojazdu${vehicleInfo ? ` w Twoim ${vehicleInfo.brand} ${vehicleInfo.model} z ${vehicleInfo.production_year} roku` : ""} - np. sprawdzenie filtrów, płynów eksploatacyjnych czy stanu opon. Nasi mechanicy chętnie doradzą w kwestiach konserwacji.`;
  }
}

export function createReservationService(supabase: SupabaseClient, openRouter?: OpenRouterService): ReservationService {
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
      recommendation_text,
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
        recommendation_text: res.recommendation_text,
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
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .select("user_id, brand, model, production_year")
        .eq("license_plate", dto.vehicle_license_plate)
        .eq("user_id", userId)
        .single();

      if (vehicleError || !vehicle) {
        throw new DatabaseError("Vehicle not owned by user", {
          license_plate: dto.vehicle_license_plate,
        });
      }

      // 2. Verify service exists and get duration
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("service_id, name, duration_minutes")
        .eq("service_id", dto.service_id)
        .single();

      if (serviceError || !service) {
        throw new DatabaseError("Service not found in the garage", { service_id: dto.service_id });
      }

      // 3. Verify employee exists
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("id, name")
        .eq("id", dto.employee_id)
        .single();

      if (employeeError || !employee) {
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
        .select("id, start_ts, end_ts, status")
        .eq("employee_id", dto.employee_id)
        .lt("start_ts", dto.end_ts)
        .gt("end_ts", dto.start_ts)
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

      if (!schedule || schedule.length === 0) {
        throw new DatabaseError("Employee not available at this time (outside schedule)", {
          employee_id: dto.employee_id,
        });
      }

      // Generate personalized recommendation using LLM
      const recommendationText = await generateRecommendation(
        openRouter,
        vehicle
          ? {
              brand: vehicle.brand,
              model: vehicle.model,
              production_year: vehicle.production_year,
            }
          : null,
        service.name
      );

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
          recommendation_text,
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
        recommendation_text: typedReservation.recommendation_text,
      };
    },

    async getReservationById(id: string, user: { id: string; role?: string }): Promise<ReservationDetailDto> {
      // Query with joins to get detailed reservation data including vehicle info
      let query = supabase
        .from("reservations")
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
        recommendation_text,
        services!inner (
          name,
          duration_minutes
        ),
        employees!inner (
          name
        ),
        vehicles!inner (
          brand,
          model
        )
      `
        )
        .eq("id", id);

      // Apply role-based filtering - users can only access their own reservations
      if (user.role !== "secretariat") {
        query = query.eq("user_id", user.id);
      }

      const { data: reservation, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new DatabaseError("Reservation not found", { id });
        }
        throw new DatabaseError("Error fetching reservation");
      }

      if (!reservation) {
        throw new DatabaseError("Reservation not found", { id });
      }

      const typedReservation = reservation as unknown as ReservationWithDetailedRelations;

      // Map to ReservationDetailDto
      return {
        id: typedReservation.id,
        user_id: typedReservation.user_id,
        service_id: typedReservation.service_id,
        service_name: typedReservation.services.name,
        service_duration_minutes: typedReservation.services.duration_minutes,
        vehicle_license_plate: typedReservation.vehicle_license_plate,
        vehicle_brand: typedReservation.vehicles.brand,
        vehicle_model: typedReservation.vehicles.model,
        employee_id: typedReservation.employee_id,
        employee_name: typedReservation.employees.name,
        start_ts: typedReservation.start_ts,
        end_ts: typedReservation.end_ts,
        status: typedReservation.status,
        created_at: typedReservation.created_at,
        updated_at: typedReservation.updated_at,
        recommendation_text: typedReservation.recommendation_text,
      };
    },

    async updateReservation(
      id: string,
      data: ReservationUpdateDto,
      user: { id: string; role?: string }
    ): Promise<ReservationDetailDto> {
      // 1. First check if reservation exists and user has access
      let existingQuery = supabase
        .from("reservations")
        .select("id, user_id, start_ts, end_ts, status, employee_id")
        .eq("id", id);

      // Apply role-based filtering
      if (user.role !== "secretariat") {
        existingQuery = existingQuery.eq("user_id", user.id);
      }

      const { data: existingReservation, error: existingError } = await existingQuery.single();

      if (existingError) {
        if (existingError.code === "PGRST116") {
          throw new DatabaseError("Reservation not found", { id });
        }
        throw new DatabaseError("Error fetching reservation");
      }

      if (!existingReservation) {
        throw new DatabaseError("Reservation not found", { id });
      }

      // 2. Business logic validations
      const now = new Date();
      const reservationStart = new Date(existingReservation.start_ts);
      const isPastReservation = reservationStart < now;

      // Only allow status changes for past reservations
      if (isPastReservation && Object.keys(data).some((key) => key !== "status")) {
        throw new DatabaseError("Cannot modify past reservation except status", {
          reservation_start: existingReservation.start_ts,
          current_time: now.toISOString(),
        });
      }

      // Validate status transitions
      if (data.status) {
        const currentStatus = existingReservation.status;
        const newStatus = data.status;

        // Status transition rules: only New can be changed, Cancelled and Completed are final
        if (currentStatus !== "New") {
          throw new DatabaseError("Cannot change status of completed or cancelled reservation", {
            current_status: currentStatus,
            requested_status: newStatus,
          });
        }

        // Only secretariat can mark as completed
        if (newStatus === "Completed" && user.role !== "secretariat") {
          throw new DatabaseError("Only secretariat can mark reservation as completed", {
            user_role: user.role,
            requested_status: newStatus,
          });
        }
      }

      // 3. Validate new service if provided
      if (data.service_id) {
        const { data: service } = await supabase
          .from("services")
          .select("service_id, name, duration_minutes")
          .eq("service_id", data.service_id)
          .single();

        if (!service) {
          throw new DatabaseError("Service not found", { service_id: data.service_id });
        }

        // If time is also being updated, validate duration matches
        const startTs = data.start_ts || existingReservation.start_ts;
        const endTs = data.end_ts || existingReservation.end_ts;
        const durationMinutes = Math.round((new Date(endTs).getTime() - new Date(startTs).getTime()) / (1000 * 60));

        if (durationMinutes !== service.duration_minutes) {
          throw new DatabaseError("Time slot duration does not match service duration", {
            expected: service.duration_minutes,
            actual: durationMinutes,
            service_id: data.service_id,
            service_name: service.name,
          });
        }
      }

      // 4. Validate new vehicle if provided
      if (data.vehicle_license_plate) {
        const { data: vehicle } = await supabase
          .from("vehicles")
          .select("user_id")
          .eq("license_plate", data.vehicle_license_plate)
          .eq("user_id", user.id)
          .single();

        if (!vehicle) {
          throw new DatabaseError("Vehicle not owned by user", {
            license_plate: data.vehicle_license_plate,
          });
        }
      }

      // 5. Validate new time slot if provided
      if (data.start_ts || data.end_ts) {
        const newStartTs = data.start_ts || existingReservation.start_ts;
        const newEndTs = data.end_ts || existingReservation.end_ts;

        // Check if new time is not in the past
        if (new Date(newStartTs) < now) {
          throw new DatabaseError("Cannot schedule reservation in the past", {
            start_ts: newStartTs,
          });
        }

        // Check for conflicts with other reservations (excluding current one)
        const { data: conflicts } = await supabase
          .from("reservations")
          .select("id")
          .eq("employee_id", existingReservation.employee_id)
          .lt("start_ts", newEndTs)
          .gt("end_ts", newStartTs)
          .not("status", "eq", "Cancelled")
          .neq("id", id);

        if (conflicts && conflicts.length > 0) {
          throw new DatabaseError("New time slot not available", {
            conflicts: conflicts.length,
            employee_id: existingReservation.employee_id,
            requested_start: newStartTs,
            requested_end: newEndTs,
          });
        }

        // Check employee schedule
        const { data: schedule } = await supabase
          .from("employee_schedules")
          .select("employee_id")
          .eq("employee_id", existingReservation.employee_id)
          .lte("start_ts", newStartTs)
          .gte("end_ts", newEndTs);

        if (!schedule || schedule.length === 0) {
          throw new DatabaseError("Employee not available at new time slot", {
            employee_id: existingReservation.employee_id,
            requested_start: newStartTs,
            requested_end: newEndTs,
          });
        }
      }

      // 6. Update reservation
      const { data: updatedReservation, error: updateError } = await supabase
        .from("reservations")
        .update(data)
        .eq("id", id)
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
          recommendation_text,
          services!inner (
            name,
            duration_minutes
          ),
          employees!inner (
            name
          ),
          vehicles!inner (
            brand,
            model
          )
        `
        )
        .single();

      if (updateError || !updatedReservation) {
        throw new DatabaseError("Error updating reservation");
      }

      const typedReservation = updatedReservation as unknown as ReservationWithDetailedRelations;

      // 7. Return updated reservation as ReservationDetailDto
      return {
        id: typedReservation.id,
        user_id: typedReservation.user_id,
        service_id: typedReservation.service_id,
        service_name: typedReservation.services.name,
        service_duration_minutes: typedReservation.services.duration_minutes,
        vehicle_license_plate: typedReservation.vehicle_license_plate,
        vehicle_brand: typedReservation.vehicles.brand,
        vehicle_model: typedReservation.vehicles.model,
        employee_id: typedReservation.employee_id,
        employee_name: typedReservation.employees.name,
        start_ts: typedReservation.start_ts,
        end_ts: typedReservation.end_ts,
        status: typedReservation.status,
        created_at: typedReservation.created_at,
        updated_at: typedReservation.updated_at,
        recommendation_text: typedReservation.recommendation_text,
      };
    },
  };
}
