// src/lib/services/vehicleService.ts
import type { SupabaseClient } from "../../db/supabase.client";
import type { VehicleCreateDto, VehicleDto } from "../../types";

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
        if (error.message.includes("license_plate")) {
          throw new Error("Vehicle with this license plate already exists");
        }
        if (error.message.includes("vin")) {
          throw new Error("Vehicle with this VIN already exists");
        }
        throw new Error("Vehicle with these details already exists");
      }

      // Handle other database errors
      throw new Error(`Failed to create vehicle: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to create vehicle: No data returned");
    }

    // Return the created vehicle (VehicleDto - without user_id)
    return data;
  }

  /**
   * Checks if a vehicle with the given license plate exists for the user
   * @param licensePlate - License plate to check
   * @param userId - ID of the authenticated user
   * @returns Promise<boolean> - True if vehicle exists
   */
  async vehicleExists(licensePlate: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("vehicles")
      .select("license_plate")
      .eq("license_plate", licensePlate)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected
      throw new Error(`Failed to check vehicle existence: ${error.message}`);
    }

    return !!data;
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
