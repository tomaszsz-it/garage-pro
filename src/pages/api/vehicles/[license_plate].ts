// src/pages/api/vehicles/[license_plate].ts
import type { APIRoute } from "astro";
import { vehicleUpdateSchema, vehiclePathParamsSchema } from "../../../lib/validation/vehicleSchemas";
import { createVehicleService } from "../../../lib/services/vehicleService";
import type { VehicleUpdateDto } from "../../../types";
import { DatabaseError } from "../../../lib/errors/database.error";

export const prerender = false;

/**
 * GET /api/vehicles/{license_plate} - Get vehicle details
 *
 * Retrieves details of a specific vehicle by license plate for the authenticated user.
 * Authentication will be implemented later.
 *
 * Path Parameters:
 * - license_plate: string (URL-encoded)
 *
 * Response: 200 OK with VehicleDto
 *
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (no JWT token)
 * - 403: Forbidden (vehicle not owned by user)
 * - 404: Not Found (vehicle not found)
 * - 500: Internal Server Error
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;

    // Validate path parameters
    const validationResult = vehiclePathParamsSchema.safeParse(params);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid path parameters",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { license_plate } = validationResult.data;

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

    // Fetch vehicle using service layer
    const vehicleService = createVehicleService(supabase);
    const vehicle = await vehicleService.getVehicleByLicensePlate(license_plate, userId);

    if (!vehicle) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Vehicle not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(JSON.stringify(vehicle), {
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
 * PATCH /api/vehicles/{license_plate} - Update vehicle
 *
 * Updates a specific vehicle by license plate for the authenticated user.
 * Authentication will be implemented later.
 *
 * Path Parameters:
 * - license_plate: string (URL-encoded)
 *
 * Request Body: VehicleUpdateDto (JSON, partial)
 * Response: 200 OK with updated VehicleDto
 *
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (no JWT token)
 * - 403: Forbidden (vehicle not owned by user)
 * - 404: Not Found (vehicle not found)
 * - 409: Conflict (duplicate VIN)
 * - 500: Internal Server Error
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const supabase = locals.supabase;

    // Validate path parameters
    const pathValidationResult = vehiclePathParamsSchema.safeParse(params);
    if (!pathValidationResult.success) {
      const errors = pathValidationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid path parameters",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { license_plate } = pathValidationResult.data;

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
    const bodyValidationResult = vehicleUpdateSchema.safeParse(requestBody);
    if (!bodyValidationResult.success) {
      const errors = bodyValidationResult.error.errors.map((err) => ({
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

    const updateData: VehicleUpdateDto = bodyValidationResult.data;

    // Check if there's actually something to update
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "No fields provided for update",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    // Update vehicle using service layer
    const vehicleService = createVehicleService(supabase);
    const updatedVehicle = await vehicleService.updateVehicle(license_plate, userId, updateData);

    // Return success response
    return new Response(JSON.stringify(updatedVehicle), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle known database errors
    if (error instanceof DatabaseError) {
      let statusCode = 400;

      // Map specific error codes to HTTP status codes
      if (error.code === "PGRST116") {
        statusCode = 404; // Not found
      } else if (error.code === "23505") {
        statusCode = 409; // Conflict (duplicate VIN)
      }

      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
          code: error.code,
        }),
        {
          status: statusCode,
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
 * DELETE /api/vehicles/{license_plate} - Delete vehicle
 *
 * Deletes a specific vehicle by license plate for the authenticated user.
 * Cannot delete vehicles with active reservations.
 * Authentication will be implemented later.
 *
 * Path Parameters:
 * - license_plate: string (URL-encoded)
 *
 * Response: 204 No Content
 *
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (no JWT token)
 * - 403: Forbidden (vehicle not owned by user)
 * - 404: Not Found (vehicle not found)
 * - 409: Conflict (vehicle has active reservations)
 * - 500: Internal Server Error
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;

    // Validate path parameters
    const validationResult = vehiclePathParamsSchema.safeParse(params);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid path parameters",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { license_plate } = validationResult.data;

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

    // Delete vehicle using service layer
    const vehicleService = createVehicleService(supabase);
    await vehicleService.deleteVehicle(license_plate, userId);

    // Return success response (204 No Content)
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Handle known database errors
    if (error instanceof DatabaseError) {
      let statusCode = 400;

      // Map specific error codes to HTTP status codes
      if (error.code === "PGRST116") {
        statusCode = 404; // Not found
      } else if (error.code === "23503") {
        statusCode = 409; // Conflict (active reservations)
      }

      return new Response(
        JSON.stringify({
          error: error.message,
          details: error.details,
          code: error.code,
        }),
        {
          status: statusCode,
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
