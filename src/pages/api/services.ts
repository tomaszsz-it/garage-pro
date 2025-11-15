import type { APIRoute } from "astro";
import type { ServiceDto } from "../../types";

export const prerender = false;

/**
 * GET /api/services - Get all available services
 *
 * Returns a list of all services available for booking.
 * Services include id, name, description, and duration in minutes.
 *
 * Response: 200 OK with ServiceDto[]
 *
 * Error Responses:
 * - 500: Internal Server Error
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const supabase = locals.supabase;

    // Fetch all services from the database
    const { data: services, error } = await supabase
      .from("services")
      .select("service_id, name, description, duration_minutes")
      .order("name");

    if (error) {
      console.error("Database error fetching services:", error);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to fetch services",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Transform to ServiceDto format (ensure description is never null)
    const servicesDto: ServiceDto[] = services.map((service) => ({
      service_id: service.service_id,
      name: service.name,
      description: service.description || "Brak opisu",
      duration_minutes: service.duration_minutes,
    }));

    return new Response(JSON.stringify(servicesDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/services:", error);

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
