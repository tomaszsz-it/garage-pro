import type { APIRoute } from "astro";
import { ReservationCreateSchema } from "../../lib/validation/reservationSchema";
import { createReservationService } from "../../lib/services/reservationService";
import type { ReservationCreateDto } from "../../types";
import { DatabaseError } from "../../lib/errors/database.error";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

/**
 * POST /api/reservations - Create a new reservation
 * 
 * Creates a new reservation for a service with specified vehicle and employee.
 * Validates time slot availability and generates service recommendations.
 * 
 * Request Body: ReservationCreateDto (JSON)
 * Response: 201 Created with ReservationDto
 * 
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 403: Forbidden (vehicle not owned by user)
 * - 404: Not Found (service/employee not found)
 * - 409: Conflict (time slot not available)
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
    const validationResult = ReservationCreateSchema.safeParse(requestBody);
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

    const reservationData: ReservationCreateDto = validationResult.data;

    // Create reservation using service layer
    const reservationService = createReservationService(supabase);
    const createdReservation = await reservationService.createReservation(
      reservationData,
      DEFAULT_USER_ID // Using default user ID for now, will be replaced with actual auth later
    );

    // Return success response
    return new Response(JSON.stringify(createdReservation), {
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
          status: error.code === "23505" ? 409 : error.status || 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Log unexpected errors (in production, use proper logging service)
    console.error("Error creating reservation:", error);

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