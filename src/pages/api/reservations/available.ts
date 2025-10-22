import type { APIRoute } from 'astro';
import { ZodError } from 'zod';
import { BadRequestError, DatabaseError } from '../../../lib/errors/database.error';
import { availableReservationsQuerySchema } from '../../../lib/validation/reservationAvailabilitySchema';
import { getAvailableReservations } from '../../../lib/services/reservationAvailabilityService';
import type { AvailableReservationsResponseDto } from '../../../types';

export const prerender = false;

/**
 * GET /reservations/available
 * Returns available reservation slots for a given service
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    const session = await locals.supabase.auth.getSession();
    if (!session.data.session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);
    
    try {
      const params = availableReservationsQuerySchema.parse(rawParams);
      
      // Get available slots
      const availableSlots = await getAvailableReservations(params, locals.supabase);

      // Return response
      const response: AvailableReservationsResponseDto = {
        data: availableSlots
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: 'Validation error',
            details: validationError.errors
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      throw validationError;
    }
  } catch (error) {
    // Handle known error types
    if (error instanceof DatabaseError) {
      if (error.message.includes('not found')) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (error instanceof BadRequestError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log unexpected errors
    console.error('Error in GET /reservations/available:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
