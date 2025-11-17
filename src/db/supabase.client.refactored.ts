import type { AstroCookies } from "astro";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types.ts";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Runtime context from hosting platform (Cloudflare Workers, Vercel Edge, etc.)
 * Renamed from CloudflareRuntime to be platform-agnostic
 */
interface PlatformRuntime {
  env?: Record<string, string>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Default user ID for public operations (viewing available slots, services)
export const DEFAULT_USER_ID = "606bb2b1-f97f-40d4-bfb9-97e1e59dc6c4";

// Cookie options for SSR
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

// ============================================================================
// ENVIRONMENT VARIABLES CACHE
// ============================================================================

/**
 * Cache for environment variables to avoid repeated lookups
 * Initialized once at module load time
 */
class EnvCache {
  private cache = new Map<string, string>();

  /**
   * Get environment variable with caching
   * @param key - Environment variable name
   * @param runtime - Optional platform runtime context
   * @returns Environment variable value
   * @throws Error if variable is not found
   */
  get(key: string, runtime?: PlatformRuntime): string {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Try platform runtime first (Cloudflare Workers, Vercel Edge, etc.)
    if (runtime?.env?.[key]) {
      const value = runtime.env[key];
      this.cache.set(key, value);
      return value;
    }

    // Fallback to import.meta.env for local development
    const envValue = import.meta.env?.[key];
    if (envValue) {
      this.cache.set(key, envValue);
      return envValue;
    }

    throw new Error(`Missing environment variable: ${key}. Check platform runtime and import.meta.env configuration.`);
  }

  /**
   * Clear cache (useful for testing)
   */
  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
const envCache = new EnvCache();

// ============================================================================
// SUPABASE CLIENT FACTORY
// ============================================================================

/**
 * Create a new Supabase client instance
 * Used for client-side operations
 *
 * @param runtime - Optional platform runtime context
 * @returns Supabase client instance
 */
export function createSupabaseClient(runtime?: PlatformRuntime) {
  const supabaseUrl = envCache.get("SUPABASE_URL", runtime);
  const supabaseAnonKey = envCache.get("SUPABASE_KEY", runtime);

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Type for Supabase client
 */
export type SupabaseClient = ReturnType<typeof createSupabaseClient>;

// ============================================================================
// SUPABASE SERVER INSTANCE
// ============================================================================

/**
 * Parse cookie header into name-value pairs
 * @param cookieHeader - Raw cookie header string
 * @returns Array of cookie name-value pairs
 */
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) return [];

  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

/**
 * Create Supabase server instance with SSR support
 * Used in middleware and API routes for server-side operations
 *
 * @param context - Request context with headers, cookies, and optional runtime
 * @returns Supabase server client instance
 */
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
  runtime?: PlatformRuntime;
}) => {
  const supabaseUrl = envCache.get("SUPABASE_URL", context.runtime);
  const supabaseAnonKey = envCache.get("SUPABASE_KEY", context.runtime);

  const cookieHeader = context.headers.get("Cookie") ?? "";
  const parsedCookies = parseCookieHeader(cookieHeader);

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parsedCookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
    global: {
      headers: {
        // Authorization header will be set by auth methods
      },
    },
  });

  return supabase;
};

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

/**
 * Clear environment cache (for testing only)
 * @internal
 */
export const __clearEnvCache = () => envCache.clear();
