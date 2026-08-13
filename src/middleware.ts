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
     * - Next internals and static/image assets
     */
    "/((?!auth(?:/|$)|dev(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
