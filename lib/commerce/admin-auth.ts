import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function createAuthenticatedServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Admin authentication requires NEXT_PUBLIC_SUPABASE_URL and a public Supabase key.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
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
          /*
           * Cookie writes can be unavailable while rendering a Server
           * Component. Authentication reads still work, and middleware or
           * server actions can refresh sessions when needed.
           */
        }
      },
    },
  });
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role =
    profile && typeof profile.role === "string"
      ? profile.role.toLowerCase()
      : "";

  if (
    profileError ||
    !profile ||
    !["owner", "admin"].includes(role)
  ) {
    redirect("/account");
  }

  return user;
}
