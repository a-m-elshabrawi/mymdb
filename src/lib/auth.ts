import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Middleware is the primary gate for (app) routes — this is defence in
 * depth, not the only check. Every (app) page reaches it transitively via
 * the (app) layout, so individual pages don't repeat the check themselves.
 *
 * Wrapped in cache() so a page that needs the user id for its own data
 * fetches (e.g. the title detail page) gets it back from memory instead of
 * a second Supabase Auth round-trip — the (app) layout already paid for
 * one this request.
 */
export const requireUser = cache(async (): Promise<User> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});
