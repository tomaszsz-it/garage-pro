// src/pages/api/vehicles.ts
import type { APIRoute } from "astro";
import { vehicleCreateSchema } from "../../lib/validation/vehicleSchemas";
import { createVehicleService } from "../../lib/services/vehicleService";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { VehicleCreateDto } from "../../types";

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
    // Log error for debugging (in production, use proper logging service)
    // Error details available in error variable for debugging

    // Handle known business logic errors
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return new Response(
          JSON.stringify({
            error: "Conflict",
            message: error.message,
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
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
