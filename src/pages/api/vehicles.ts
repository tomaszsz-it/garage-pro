// src/pages/api/vehicles.ts
import type { APIRoute } from "astro";
import { vehicleCreateSchema } from "../../lib/validation/vehicleSchemas";
import { createVehicleService } from "../../lib/services/vehicleService";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { VehicleCreateDto, VehiclesListResponseDto } from "../../types";
import { DatabaseError } from "../../lib/errors/database.error";

export const GET: APIRoute = async () => {
  const mockVehicles = [
    {
      idx: 6,
      license_plate: "WAW1234",
      user_id: DEFAULT_USER_ID,
      vin: "1FUJA6CK14LM94382",
      brand: "Volkswagen",
      model: "Passat",
      production_year: 2020,
      car_type: "Sedan B8",
      created_at: "2025-10-18 16:08:05.270615+00",
    },
  ];

  const response: VehiclesListResponseDto = {
    data: mockVehicles,
    pagination: {
      page: 1,
      limit: 10,
      total: mockVehicles.length,
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * POST /api/vehicles - Create a new vehicle
 *
 * Creates a new vehicle for the default user.
 * Authentication will be implemented later.
 *
 * Request Body: VehicleCreateDto (JSON)
 * Response: 201 Created with VehicleDto
 *
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 409: Conflict (duplicate license_plate or VIN)
 * - 500: Internal Server Error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate request data with Zod schema
    const validationResult = vehicleCreateSchema.safeParse(requestBody);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Validation failed",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const vehicleData: VehicleCreateDto = validationResult.data;

    // Create vehicle using service layer
    const vehicleService = createVehicleService(supabase);
    const createdVehicle = await vehicleService.createVehicle(vehicleData, DEFAULT_USER_ID);

    // Return success response
    return new Response(JSON.stringify(createdVehicle), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle known database errors
    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
          code: error.code,
        }),
        {
          status: error.code === "23505" ? 409 : 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle unexpected errors
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
