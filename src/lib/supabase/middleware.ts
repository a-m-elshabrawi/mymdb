import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = new Set(["/login", "/signup"]);

// Routes reachable while logged out. "/" is the public marketing landing page;
// everything else in the app requires a session. Auth routes are handled
// separately below (they redirect authenticated users away).
const PUBLIC_ROUTES = new Set(["/"]);

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not add code between createServerClient and getUser(). getSession()
  // trusts the (possibly stale/forged) cookie JWT without revalidating it
  // against Supabase Auth — only getUser() actually checks the token here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  // Copies Supabase's freshly-refreshed auth cookies onto a redirect. A bare
  // NextResponse.redirect doesn't carry them, and dropping them quietly logs
  // the user out on the very next navigation.
  const redirectTo = (pathnameTarget: string, next?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathnameTarget;
    url.search = "";
    if (next) {
      url.searchParams.set("next", next);
    }
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };

  // Logged in: the marketing landing page ("/") and the auth pages are noise —
  // send them to the dashboard instead.
  if (user && (isAuthRoute || isPublicRoute)) {
    return redirectTo("/home");
  }

  // Logged out: everything except the public landing and auth pages is gated.
  // "/home" hits this branch and bounces to /login?next=/home as before.
  if (!user && !isAuthRoute && !isPublicRoute) {
    return redirectTo("/login", `${pathname}${search}`);
  }

  // Must return supabaseResponse itself, not a new NextResponse.next() —
  // it's the one carrying the refreshed auth cookies.
  return supabaseResponse;
}
