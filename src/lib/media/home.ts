import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { DiaryEntryRow, LibraryRow } from "@/lib/media/library";

const CONTINUE_WATCHING_LIMIT = 12;
const WATCHLIST_PREVIEW_LIMIT = 6;
const RECENTLY_LOGGED_LIMIT = 6;

export async function hasAnyLibraryActivity(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("user_media")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (count ?? 0) > 0;
}

export interface HomeStats {
  loggedThisYear: number;
  allTimeWatched: number;
  averageRating: number | null;
}

export async function getHomeStats(userId: string): Promise<HomeStats> {
  const supabase = await createClient();
  const currentYear = new Date().getUTCFullYear();

  const [loggedThisYearResult, allTimeWatchedResult, ratingsResult] = await Promise.all([
    supabase
      .from("watch_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("watched_on", `${currentYear}-01-01`)
      .lte("watched_on", `${currentYear}-12-31`),
    supabase
      .from("user_library")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "watched"),
    supabase
      .from("user_library")
      .select("user_rating")
      .eq("user_id", userId)
      .eq("status", "watched")
      .not("user_rating", "is", null),
  ]);

  if (loggedThisYearResult.error) throw loggedThisYearResult.error;
  if (allTimeWatchedResult.error) throw allTimeWatchedResult.error;
  if (ratingsResult.error) throw ratingsResult.error;

  const ratings = (ratingsResult.data ?? [])
    .map((row) => row.user_rating)
    .filter((rating): rating is number => rating !== null);

  const averageRating =
    ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;

  return {
    loggedThisYear: loggedThisYearResult.count ?? 0,
    allTimeWatched: allTimeWatchedResult.count ?? 0,
    averageRating,
  };
}

export async function getContinueWatching(userId: string): Promise<LibraryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_library")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "watching")
    .order("updated_at", { ascending: false })
    .limit(CONTINUE_WATCHING_LIMIT);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getWatchlistPreview(userId: string): Promise<LibraryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_library")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "watchlist")
    .order("added_at", { ascending: true })
    .limit(WATCHLIST_PREVIEW_LIMIT);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getRecentlyLogged(userId: string): Promise<DiaryEntryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diary_entries_view")
    .select("*")
    .eq("user_id", userId)
    .order("watched_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(RECENTLY_LOGGED_LIMIT);

  if (error) {
    throw error;
  }

  return data ?? [];
}
