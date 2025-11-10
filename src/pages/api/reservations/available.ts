import type { APIRoute } from "astro";
import { DatabaseError } from "../../../lib/errors/database.error";
import { availableReservationsQuerySchema } from "../../../lib/validation/reservationAvailabilitySchema";
import { getAvailableReservations } from "../../../lib/services/reservationAvailabilityService";
import { DEFAULT_USER_ID } from "../../../db/supabase.client.ts";
import type { AvailableReservationsQueryParams } from "../../../types";

export const prerender = false;

/**
 * GET /api/reservations/available - Get available reservation slots
 *
 * Returns available reservation slots for a given service based on query parameters.
 * Authentication will be implemented later.
 *
 * Query Parameters:
 * - service_id: number
 * - date: string (YYYY-MM-DD)
 *
 * Response: 200 OK with AvailableReservationsResponseDto
 *
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 404: Not Found (service not found)
 * - 500: Internal Server Error
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;

    // Parse and validate query parameters
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    
    const validationResult = availableReservationsQuerySchema.safeParse(rawParams);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      // Debug logging
      console.log("Validation errors:", errors);

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

    const params = validationResult.data;
    const availableSlots = await getAvailableReservations(params as AvailableReservationsQueryParams, supabase);

    // Return success response
    return new Response(
      JSON.stringify({
        data: availableSlots,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    // Handle known database errors
    if (error instanceof DatabaseError) {
      if (error.message.includes("not found")) {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: error.message,
            details: (error as DatabaseError).details,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      return new Response(
        JSON.stringify({
          error: error.message,
          details: (error as DatabaseError).details,
          code: (error as DatabaseError).code,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Log unexpected errors (in production, use proper logging service)
    // eslint-disable-next-line no-console
    console.error("Error in GET /reservations/available:", error);

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
