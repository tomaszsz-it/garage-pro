import type { AstroCookies } from "astro";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types.ts";
import type { PlatformRuntime } from "../env.d.ts";

// Default user ID for public operations (viewing available slots, services)
export const DEFAULT_USER_ID = "606bb2b1-f97f-40d4-bfb9-97e1e59dc6c4";

// Cache for environment variables to avoid repeated lookups
const envCache = new Map<string, string>();

// Helper to get env variables with caching (works both locally and on hosting platforms)
function getEnv(key: string, runtime?: PlatformRuntime): string {
  // Check cache first
  const cached = envCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  let value: string | undefined;

  // Try platform runtime first (Cloudflare Workers, Vercel Edge, etc.)
  if (runtime?.env?.[key]) {
    value = runtime.env[key];
  }
  // Fallback to import.meta.env for local development
  else if (import.meta.env?.[key]) {
    value = import.meta.env[key];
  }

  if (value) {
    envCache.set(key, value);
    return value;
  }

  throw new Error(`Missing environment variable: ${key}. Check runtime and import.meta.env configuration.`);
}

// Client-side Supabase client (now a factory function)
export function createSupabaseClient(runtime?: PlatformRuntime) {
  const supabaseUrl = getEnv("SUPABASE_URL", runtime);
  const supabaseAnonKey = getEnv("SUPABASE_KEY", runtime);

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// For backwards compatibility - will be created on first use
let _cachedClient: ReturnType<typeof createSupabaseClient> | null = null;
export function getSupabaseClient(runtime?: PlatformRuntime) {
  if (!_cachedClient) {
    _cachedClient = createSupabaseClient(runtime);
  }
  return _cachedClient;
}

// Alias for compatibility
export const supabaseClient = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(target, prop) {
    if (!_cachedClient) {
      throw new Error(
        "supabaseClient must be initialized with runtime context first. Use createSupabaseClient(runtime) or getSupabaseClient(runtime)"
      );
    }
    return (_cachedClient as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;

// Cookie options for SSR
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

// Server-side Supabase client for SSR
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
  runtime?: PlatformRuntime;
}) => {
  const supabaseUrl = getEnv("SUPABASE_URL", context.runtime);
  const supabaseAnonKey = getEnv("SUPABASE_KEY", context.runtime);

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
        // Ensure Authorization header is set from session
        // This will be populated by the auth methods
      },
    },
  });

  return supabase;
};
