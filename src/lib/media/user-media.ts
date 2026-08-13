import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type MediaType = Database["public"]["Enums"]["media_type"];
export type UserMediaRow = Database["public"]["Tables"]["user_media"]["Row"];
export type WatchEntryRow = Database["public"]["Tables"]["watch_entries"]["Row"];

export async function getUserMedia(
  userId: string,
  tmdbId: number,
  mediaType: MediaType,
): Promise<UserMediaRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_media")
    .select("*")
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Newest-first by watched_on (the viewing date), with created_at as the
 * tiebreaker. This ordering doubles as the definition of "most recent
 * entry" that log.ts's updateEntry() uses to decide whether an edited
 * rating should sync back to user_media.rating.
 */
export async function getWatchEntries(
  userId: string,
  tmdbId: number,
  mediaType: MediaType,
): Promise<WatchEntryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("watch_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .order("watched_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
