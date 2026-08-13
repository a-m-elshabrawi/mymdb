"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { parseWatchlistFilters, pickRandomWatchlistItem } from "@/lib/media/watchlist";

function formDataToRawParams(formData: FormData): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}

/**
 * "Surprise me" — picks a random title from the watchlist, scoped to
 * whatever type/genre/decade/maxRuntime filters were active on the page
 * (sent along as hidden form fields), and redirects straight to it.
 * Filtering to "under 90m, comedy" and then rolling the dice is the point,
 * so this must never fall back to the unfiltered watchlist.
 */
export async function surpriseMe(formData: FormData): Promise<void> {
  const user = await requireUser();
  const filters = parseWatchlistFilters(formDataToRawParams(formData));

  const pick = await pickRandomWatchlistItem(user.id, filters);

  if (!pick) {
    // The button is disabled client-side whenever the filtered set is
    // empty — this is just a defensive fallback if it's ever submitted
    // anyway (e.g. a stale page).
    redirect("/watchlist");
  }

  redirect(`/${pick.mediaType}/${pick.tmdbId}`);
}
