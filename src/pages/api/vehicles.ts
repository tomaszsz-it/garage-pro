// src/pages/api/vehicles.ts
import type { APIRoute } from "astro";
import { vehicleCreateSchema, vehiclesQuerySchema } from "../../lib/validation/vehicleSchemas";
import { createVehicleService } from "../../lib/services/vehicleService";
import type { VehicleCreateDto, VehiclesListResponseDto } from "../../types";
import { DatabaseError } from "../../lib/errors/database.error";

export const prerender = false;

/**
 * GET /api/vehicles - List vehicles with pagination
 *
 * Retrieves a paginated list of vehicles for the authenticated user.
 * Authentication will be implemented later.
 *
 * Query Parameters:
 * - page: number (default: 1, min: 1)
 * - limit: number (default: 20, max: 100)
 *
 * Response: 200 OK with VehiclesListResponseDto
 *
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (no JWT token)
 * - 500: Internal Server Error
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;
    const url = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = vehiclesQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid query parameters",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const params = validationResult.data;

    // Get user from context (from middleware)
    const user = locals.user;
    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;

    // Add total to params to satisfy VehiclesQueryParams type requirement
    const paramsWithTotal = {
      ...params,
      total: 0, // This will be overwritten by the service
    };

    // Fetch vehicles using service layer
    const vehicleService = createVehicleService(supabase);
    const vehiclesResponse = await vehicleService.getVehicles(userId, paramsWithTotal);

    // Return success response
    return new Response(JSON.stringify(vehiclesResponse), {
      status: 200,
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
          status: 400,
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

/**
 * POST /api/vehicles - Create a new vehicle
 *
 * Creates a new vehicle for the authenticated user.
 * Authentication will be implemented later.
 *
 * Request Body: VehicleCreateDto (JSON)
 * Response: 201 Created with VehicleDto
 *
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (no JWT token)
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

    // Get user from context (from middleware)
    const user = locals.user;
    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;

    // Create vehicle using service layer
    const vehicleService = createVehicleService(supabase);
    const createdVehicle = await vehicleService.createVehicle(vehicleData, userId);

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
