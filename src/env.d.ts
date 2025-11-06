/// <reference types="astro/client" />

import type { SupabaseClient } from "./db/supabase.client.ts";

// User type for authentication context
export interface User {
  id: string;
  email?: string;
  role?: string;
}

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user?: User;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string; //TODO do sprawdzenia czemu to zostało wygenerowane przez api-supabase-astro-init.mdc
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
