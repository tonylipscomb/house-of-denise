import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPrefixes = ["/account", "/admin"];

function safeNext(pathname: string) {
  return pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/";
}

function isPublicAdminPath(pathname: string) {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) return response;

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  const { data } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isProtected =
    protectedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    ) && !isPublicAdminPath(pathname);

  if (isProtected && !data.user) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    url.searchParams.set("next", safeNext(pathname));
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/admin",
    "/admin/:path*",
    "/auth/callback"
  ]
};
