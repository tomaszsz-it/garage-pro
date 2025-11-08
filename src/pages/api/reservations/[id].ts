import type { APIRoute } from "astro";
import { getReservationByIdParamsSchema, ReservationUpdateSchema } from "../../../lib/validation/reservationSchema";
import { createReservationService } from "../../../lib/services/reservationService";
import type { ReservationUpdateDto } from "../../../types";
import { DatabaseError } from "../../../lib/errors/database.error";

export const prerender = false;

/**
 * GET /api/reservations/{id} - Get reservation by ID
 *
 * Retrieves detailed information about a specific reservation including
 * service details, employee information, and vehicle data.
 * Users can only access their own reservations unless they have secretariat role.
 *
 * Path Parameters:
 * - id: string (UUID) - Reservation ID
 *
 * Response: 200 OK with ReservationDetailDto
 *
 * Error Responses:
 * - 400: Bad Request (invalid UUID)
 * - 401: Unauthorized (no JWT token)
 * - 403: Forbidden (access denied to this reservation)
 * - 404: Not Found (reservation not found)
 * - 500: Internal Server Error
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;

    // Validate path parameters
    const validationResult = getReservationByIdParamsSchema.safeParse(params);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid reservation ID",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = validationResult.data;

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

    // Add role for service layer - assume regular user unless specified otherwise
    const userWithRole = {
      ...user,
      role: user.role || "user", // Default to "user" role if not specified
    };

    // Fetch reservation using service layer
    const reservationService = createReservationService(supabase);
    const reservation = await reservationService.getReservationById(id, userWithRole);

    // Return success response
    return new Response(JSON.stringify(reservation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle known database errors
    if (error instanceof DatabaseError) {
      let statusCode = 400;
      
      // Map specific error messages to appropriate HTTP status codes
      if (error.message.includes("not found")) {
        statusCode = 404;
      } else if (error.message.includes("Access denied")) {
        statusCode = 403;
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
 * PATCH /api/reservations/{id} - Update reservation
 *
 * Updates an existing reservation. Allows changing service, vehicle, time slot, or status.
 * Business rules:
 * - Past reservations can only have status changed
 * - Only "New" status can be changed to "Cancelled" or "Completed"
 * - Only secretariat can mark reservations as "Completed"
 * - Time slots must be available and within employee schedule
 * - Service duration must match new time range
 * - Vehicle must be owned by user
 *
 * Path Parameters:
 * - id: string (UUID) - Reservation ID
 *
 * Request Body: ReservationUpdateDto (JSON, partial)
 * Response: 200 OK with updated ReservationDetailDto
 *
 * Error Responses:
 * - 400: Bad Request (validation errors, business rule violations)
 * - 401: Unauthorized (no JWT token)
 * - 403: Forbidden (access denied, insufficient permissions)
 * - 404: Not Found (reservation/service/vehicle not found)
 * - 409: Conflict (time slot not available)
 * - 500: Internal Server Error
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const supabase = locals.supabase;

    // Validate path parameters
    const paramsValidationResult = getReservationByIdParamsSchema.safeParse(params);
    if (!paramsValidationResult.success) {
      const errors = paramsValidationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid reservation ID",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = paramsValidationResult.data;

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
    const bodyValidationResult = ReservationUpdateSchema.safeParse(requestBody);
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

    const updateData: ReservationUpdateDto = bodyValidationResult.data;

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

    // Add role for service layer - assume regular user unless specified otherwise
    const userWithRole = {
      ...user,
      role: user.role || "user", // Default to "user" role if not specified
    };

    // Update reservation using service layer
    const reservationService = createReservationService(supabase);
    const updatedReservation = await reservationService.updateReservation(id, updateData, userWithRole);

    // Return success response
    return new Response(JSON.stringify(updatedReservation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle known database errors
    if (error instanceof DatabaseError) {
      let statusCode = 400;
      
      // Map specific error messages to appropriate HTTP status codes
      if (error.message.includes("not found")) {
        statusCode = 404;
      } else if (error.message.includes("Access denied") || 
                 error.message.includes("Only secretariat can") ||
                 error.message.includes("insufficient permissions")) {
        statusCode = 403;
      } else if (error.message.includes("not available") || 
                 error.message.includes("conflicts") ||
                 error.message.includes("Time slot not available")) {
        statusCode = 409;
      } else if (error.message.includes("Cannot modify past") ||
                 error.message.includes("Cannot change status") ||
                 error.message.includes("Invalid status transition") ||
                 error.message.includes("Cannot schedule reservation in the past") ||
                 error.message.includes("duration does not match") ||
                 error.message.includes("not owned by user") ||
                 error.message.includes("Employee not available")) {
        statusCode = 400;
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
