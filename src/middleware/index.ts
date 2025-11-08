import { createSupabaseServerInstance, supabaseClient } from '../db/supabase.client.ts';
import { defineMiddleware } from 'astro:middleware';

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/forgot-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/forgot-password",
  "/api/auth/logout",
  // Public API endpoints
  "/api/reservations/available",
  "/api/services",
  // Public pages
  "/",
  "/reservations/available",
];

export const onRequest = defineMiddleware(
  async ({ locals, cookies, url, request, redirect }, next) => {
    // For public API endpoints, use regular supabase client without session
    if (url.pathname.startsWith('/api/') && PUBLIC_PATHS.includes(url.pathname)) {
      locals.supabase = supabaseClient;
      return next();
    }

    // For all other routes, use server instance with session management
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // IMPORTANT: Always get user session first before any other operations
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Always set user context if session exists
    if (user) {
      locals.user = {
        email: user.email,
        id: user.id,
      };
    }

    // Set supabase client in locals for protected routes
    locals.supabase = supabase;

    // Only redirect to login for protected routes when user is not authenticated
    if (!user && !PUBLIC_PATHS.includes(url.pathname)) {
      return redirect('/auth/login');
    }

    return next();
  },
);
