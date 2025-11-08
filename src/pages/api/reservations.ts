import type { APIRoute } from "astro";
import { ReservationCreateSchema, getReservationsQuerySchema } from "../../lib/validation/reservationSchema";
import { createReservationService } from "../../lib/services/reservationService";
import type { ReservationCreateDto } from "../../types";
import { DatabaseError } from "../../lib/errors/database.error";
import { createOpenRouterService } from "../../lib/openrouter.service";

export const prerender = false;

/**
 * GET /api/reservations - List reservations with pagination
 *
 * Retrieves a list of reservations with pagination. Regular users can only see their own reservations,
 * while secretariat role can see all reservations.
 *
 * Query Parameters:
 * - page: number (default: 1, min: 1)
 * - limit: number (default: 20, max: 100)
 *
 * Response: 200 OK with ReservationsListResponseDto
 *
 * Error Responses:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (no JWT token)
 * - 500: Internal Server Error
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const supabase = locals.supabase;

    // For GET requests, we don't need the OpenRouter service as it's only used for recommendations
    // during reservation creation
    const url = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = getReservationsQuerySchema.safeParse(queryParams);

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

    // Add role for service layer - assume regular user unless specified otherwise
    const userWithRole = {
      ...user,
      role: user.role || "user", // Default to "user" role if not specified
    };

    // Add total to params to satisfy PaginationDto type requirement
    const paramsWithTotal = {
      ...params,
      total: 0, // This will be overwritten by the service
    };

    // Fetch reservations using service layer
    const reservationService = createReservationService(supabase);
    const reservationsResponse = await reservationService.getReservations(paramsWithTotal, userWithRole);

    // Return success response
    return new Response(JSON.stringify(reservationsResponse), {
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

    // Create OpenRouter service instance
    let openRouterService;
    try {
      openRouterService = createOpenRouterService({
        apiKey: import.meta.env.OPENROUTER_API_KEY,
        defaultModel: "openai/gpt-4o-mini",
        defaultModelParameters: {
          temperature: 0.7,
          max_tokens: 150,
        },
      });
    } catch (error) {
      console.error("Failed to initialize OpenRouter service:", error);
      // Continue without OpenRouter service - will use fallback recommendations
    }

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

    // Create reservation using service layer with OpenRouter integration
    const reservationService = createReservationService(supabase, openRouterService);
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

    const createdReservation = await reservationService.createReservation(
      reservationData,
      user.id
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
          status: error.code === "23505" ? 409 : 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // In production, log unexpected errors to a proper logging service
    // For now, errors will be handled silently

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
