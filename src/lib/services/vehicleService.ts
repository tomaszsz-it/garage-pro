// src/lib/services/vehicleService.ts
import type { SupabaseClient } from "../../db/supabase.client";
import type {
  VehicleCreateDto,
  VehicleDto,
  VehicleUpdateDto,
  VehiclesListResponseDto,
  VehiclesQueryParams,
} from "../../types";
import { DatabaseError } from "../errors/database.error";

/**
 * Service class for vehicle-related operations
 */
export class VehicleService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Creates a new vehicle for the authenticated user
   * @param dto - Vehicle creation data
   * @param userId - ID of the authenticated user
   * @returns Promise<VehicleDto> - Created vehicle data (without user_id)
   * @throws Error if creation fails or user is not authenticated
   */
  async createVehicle(dto: VehicleCreateDto, userId: string): Promise<VehicleDto> {
    if (!userId) {
      throw new Error("User ID is required to create a vehicle");
    }

    // Prepare data for insertion (add user_id from auth context)
    const vehicleData = {
      ...dto,
      user_id: userId,
    };

    // Insert vehicle into database
    const { data, error } = await this.supabase
      .from("vehicles")
      .insert(vehicleData)
      .select("license_plate, vin, brand, model, production_year, car_type, created_at")
      .single();

    if (error) {
      // Handle specific database errors
      if (error.code === "23505") {
        // Unique constraint violation
        throw new DatabaseError(
          "Vehicle with these details already exists",
          { field: error.message.includes("license_plate") ? "license_plate" : "vin" },
          error.code
        );
      }

      // Handle other database errors
      throw new DatabaseError("Failed to create vehicle", error, error.code);
    }

    if (!data) {
      throw new Error("Failed to create vehicle: No data returned");
    }

    // Return the created vehicle (VehicleDto - without user_id)
    return data;
  }

  /**
   * Gets a paginated list of vehicles for the authenticated user
   * @param userId - ID of the authenticated user
   * @param params - Pagination parameters
   * @returns Promise<VehiclesListResponseDto> - List of vehicles with pagination metadata
   */
  async getVehicles(userId: string, params: VehiclesQueryParams): Promise<VehiclesListResponseDto> {
    if (!userId) {
      throw new Error("User ID is required to fetch vehicles");
    }

    // Get total count first
    const { count, error: countError } = await this.supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      throw new DatabaseError("Failed to count vehicles", countError, countError.code);
    }

    const total = count || 0;

    // Get paginated data
    const { data, error } = await this.supabase
      .from("vehicles")
      .select("license_plate, vin, brand, model, production_year, car_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range((params.page - 1) * params.limit, params.page * params.limit - 1);

    if (error) {
      throw new DatabaseError("Failed to fetch vehicles", error, error.code);
    }

    return {
      data: data || [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
      },
    };
  }

  /**
   * Gets a single vehicle by license plate for the authenticated user
   * @param licensePlate - License plate to search for
   * @param userId - ID of the authenticated user
   * @returns Promise<VehicleDto | null> - Vehicle data or null if not found
   */
  async getVehicleByLicensePlate(licensePlate: string, userId: string): Promise<VehicleDto | null> {
    if (!userId) {
      throw new Error("User ID is required to fetch vehicle");
    }

    const { data, error } = await this.supabase
      .from("vehicles")
      .select("license_plate, vin, brand, model, production_year, car_type, created_at")
      .eq("license_plate", licensePlate)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new DatabaseError("Failed to fetch vehicle", error, error.code);
    }

    return data;
  }

  /**
   * Updates a vehicle by license plate for the authenticated user
   * @param licensePlate - License plate of the vehicle to update
   * @param userId - ID of the authenticated user
   * @param updateData - Data to update
   * @returns Promise<VehicleDto> - Updated vehicle data
   */
  async updateVehicle(licensePlate: string, userId: string, updateData: VehicleUpdateDto): Promise<VehicleDto> {
    if (!userId) {
      throw new Error("User ID is required to update vehicle");
    }

    // First check if vehicle exists and belongs to user
    const existingVehicle = await this.getVehicleByLicensePlate(licensePlate, userId);
    if (!existingVehicle) {
      throw new DatabaseError("Vehicle not found", { field: "license_plate" }, "PGRST116");
    }

    // Update the vehicle
    const { data, error } = await this.supabase
      .from("vehicles")
      .update(updateData)
      .eq("license_plate", licensePlate)
      .eq("user_id", userId)
      .select("license_plate, vin, brand, model, production_year, car_type, created_at")
      .single();

    if (error) {
      // Handle specific database errors
      if (error.code === "23505") {
        // Unique constraint violation (VIN)
        throw new DatabaseError("Vehicle with this VIN already exists", { field: "vin" }, error.code);
      }
      throw new DatabaseError("Failed to update vehicle", error, error.code);
    }

    if (!data) {
      throw new Error("Failed to update vehicle: No data returned");
    }

    return data;
  }

  /**
   * Deletes a vehicle by license plate for the authenticated user
   * @param licensePlate - License plate of the vehicle to delete
   * @param userId - ID of the authenticated user
   * @throws Error if vehicle has active reservations
   */
  async deleteVehicle(licensePlate: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error("User ID is required to delete vehicle");
    }

    // First check if vehicle exists and belongs to user
    const existingVehicle = await this.getVehicleByLicensePlate(licensePlate, userId);
    if (!existingVehicle) {
      throw new DatabaseError("Vehicle not found", { field: "license_plate" }, "PGRST116");
    }

    // Check for active reservations
    const hasActiveReservations = await this.hasActiveReservations(licensePlate);
    if (hasActiveReservations) {
      throw new DatabaseError(
        "Cannot delete vehicle with active reservations",
        { field: "license_plate" },
        "23503" // Foreign key constraint violation code
      );
    }

    // Delete the vehicle
    const { error } = await this.supabase
      .from("vehicles")
      .delete()
      .eq("license_plate", licensePlate)
      .eq("user_id", userId);

    if (error) {
      throw new DatabaseError("Failed to delete vehicle", error, error.code);
    }
  }

  /**
   * Checks if a vehicle has active reservations
   * @param licensePlate - License plate to check
   * @returns Promise<boolean> - True if vehicle has active reservations
   */
  async hasActiveReservations(licensePlate: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("vehicle_license_plate", licensePlate)
      .in("status", ["New"]); // Active statuses - only "New" is valid according to ReservationStatus enum

    if (error) {
      throw new DatabaseError("Failed to check active reservations", error, error.code);
    }

    return (count || 0) > 0;
  }

  /**
   * Checks if a vehicle with the given license plate exists for the user
   * @param licensePlate - License plate to check
   * @param userId - ID of the authenticated user
   * @returns Promise<boolean> - True if vehicle exists
   */
  async vehicleExists(licensePlate: string, userId: string): Promise<boolean> {
    const vehicle = await this.getVehicleByLicensePlate(licensePlate, userId);
    return vehicle !== null;
  }
}

/**
 * Factory function to create VehicleService instance
 * @param supabase - Supabase client instance
 * @returns VehicleService instance
 */
export function createVehicleService(supabase: SupabaseClient): VehicleService {
  return new VehicleService(supabase);
}
