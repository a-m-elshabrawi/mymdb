import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on everything except:
     * - /auth/* (email confirmation callback — must work while logged out)
     * - /dev/* (Stage 1 health check — dev utility, not gated)
     * - robots.txt / sitemap.xml and the icon/apple-icon metadata routes —
     *   these must be reachable by crawlers and browsers while logged out, or
     *   the public landing page can't be indexed and its favicon/OG break
     * - Next internals and static/image assets
     */
    "/((?!auth(?:/|$)|dev(?:/|$)|robots\\.txt|sitemap\\.xml|icon|apple-icon|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
