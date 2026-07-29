import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  assertAdminSupabaseConfig,
  logSupabaseEnvDiagnostics
} from "./env";
import type { Database } from "./types";

let productionClient: SupabaseClient<Database> | null = null;
let loggedDiagnostics = false;

function createAdminClient(): SupabaseClient<Database> | null {
  try {
    const { url, serviceRoleKey } = assertAdminSupabaseConfig();

    if (!loggedDiagnostics || process.env.NODE_ENV !== "production") {
      logSupabaseEnvDiagnostics("admin-client");
      loggedDiagnostics = true;
    }

    return createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          "X-Client-Info": "house-of-denise-server"
        }
      }
    });
  } catch (error) {
    logSupabaseEnvDiagnostics("admin-client-config-error");
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[supabase-admin]",
        error instanceof Error ? error.message : "Admin client configuration failed."
      );
    }
    return null;
  }
}

export function getSupabaseAdminClient() {
  /*
   * In development, create a fresh client so Turbopack/HMR cannot retain
   * stale environment values after .env.local changes.
   */
  if (process.env.NODE_ENV !== "production") {
    return createAdminClient();
  }

  productionClient ??= createAdminClient();
  return productionClient;
}

export function requireSupabaseAdminClient() {
  const { url, serviceRoleKey } = assertAdminSupabaseConfig();
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error(
      "Supabase admin client could not be created. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  // Touch resolved credentials so callers fail fast on config issues.
  void url;
  void serviceRoleKey;
  return client;
}
