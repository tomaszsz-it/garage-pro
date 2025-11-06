import { defineMiddleware } from "astro:middleware";
import { supabaseClient, DEFAULT_USER_ID } from "../db/supabase.client.ts";
import type { User } from "../env.d.ts";

/**
 * Middleware for handling authentication and setting up context
 * 
 * This middleware:
 * 1. Sets up Supabase client in context.locals
 * 2. Extracts and validates JWT token from Authorization header
 * 3. Sets user information in context.locals.user
 * 4. For now, uses DEFAULT_USER_ID for testing (JWT validation will be implemented later)
 */
export const onRequest = defineMiddleware(async (context, next) => {
  // Always set up Supabase client
  context.locals.supabase = supabaseClient;

  // Extract JWT token from Authorization header
  const authHeader = context.request.headers.get("Authorization");
  
  // For API routes, attempt to authenticate
  if (context.url.pathname.startsWith("/api/")) {
    try {
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        
        // TODO: Implement proper JWT validation with Supabase
        // For now, we'll use a simple check and default user
        if (token && token.length > 0) {
          // In a real implementation, we would:
          // 1. Validate the JWT token with Supabase
          // 2. Extract user information from the token
          // 3. Set context.locals.user with actual user data
          
          // For testing purposes, set default user
          const user: User = {
            id: DEFAULT_USER_ID,
            email: "test@example.com",
            role: "user", // or "secretariat" for admin operations
          };
          
          context.locals.user = user;
        } else {
          // Invalid token format
          return new Response(
            JSON.stringify({
              error: "Unauthorized",
              message: "Invalid token format",
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } else {
        // For development/testing, allow requests without auth header
        // In production, this should return 401 for protected routes
        const user: User = {
          id: DEFAULT_USER_ID,
          email: "test@example.com",
          role: "user",
        };
        
        context.locals.user = user;
      }
    } catch (error) {
      // JWT validation failed
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Invalid or expired token",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  return next();
});
