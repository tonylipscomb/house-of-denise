import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function createAuthenticatedServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publicKey) {
    throw new Error(
      "Admin authentication requires NEXT_PUBLIC_SUPABASE_URL and a public Supabase key.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, publicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Cookie writes may be unavailable during Server Component rendering.
        }
      },
    },
  });
}

function normalizedRole(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function requireCommerceAdmin() {
  const supabase = await createAuthenticatedServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /*
   * Primary role source: app_metadata.
   * This is written only by trusted server/admin code and cannot be changed
   * by ordinary browser users.
   */
  const metadataRole = normalizedRole(user.app_metadata?.role);

  if (["owner", "admin"].includes(metadataRole)) {
    return user;
  }

  /*
   * Compatibility fallback for projects that later add a public.profiles
   * table. A missing table is not fatal because app_metadata remains the
   * trusted role source for this project.
   */
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const profileRole = normalizedRole(profile?.role);

  if (!["owner", "admin"].includes(profileRole)) {
    redirect("/account");
  }

  return user;
}
