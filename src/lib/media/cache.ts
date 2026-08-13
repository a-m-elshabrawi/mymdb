import "server-only";

import { cache } from "react";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { getMovieDetails, getTvDetails, TmdbError, type Media } from "@/lib/tmdb";

const TTL_RETURNING_SERIES_MS = 7 * 24 * 60 * 60 * 1000;
const TTL_DEFAULT_MS = 30 * 24 * 60 * 60 * 1000;

type MediaRow = Database["public"]["Tables"]["media"]["Row"];
type MediaType = Database["public"]["Enums"]["media_type"];

function rowToMedia(row: MediaRow): Media {
  return {
    tmdb_id: row.tmdb_id,
    media_type: row.media_type,
    title: row.title,
    original_title: row.original_title,
    release_date: row.release_date,
    year: row.year,
    poster_path: row.poster_path,
    backdrop_path: row.backdrop_path,
    overview: row.overview,
    runtime: row.runtime,
    genres: row.genres,
    tmdb_rating: row.tmdb_rating,
    tmdb_vote_count: row.tmdb_vote_count,
    number_of_seasons: row.number_of_seasons,
    number_of_episodes: row.number_of_episodes,
    status: row.status,
  };
}

function ttlFor(mediaType: MediaType, status: string | null): number {
  if (mediaType === "tv" && status === "Returning Series") {
    return TTL_RETURNING_SERIES_MS;
  }
  return TTL_DEFAULT_MS;
}

function isFresh(row: MediaRow): boolean {
  const syncedAt = new Date(row.synced_at).getTime();
  return Date.now() - syncedAt < ttlFor(row.media_type, row.status);
}

/**
 * Cache-on-demand read for a single title. Wrapped in React's cache() so a
 * page and its generateMetadata (which both need the same title) share one
 * DB read and, on a cache miss, one TMDB call instead of duplicating both.
 */
export const getOrFetchMedia = cache(
  async (tmdbId: number, mediaType: MediaType): Promise<Media | null> => {
    const supabase = await createClient();
    const { data: existing, error: readError } = await supabase
      .from("media")
      .select("*")
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType)
      .maybeSingle();

    if (readError) {
      throw readError;
    }

    if (existing && isFresh(existing)) {
      return rowToMedia(existing);
    }

    let fresh: Media;
    try {
      fresh = mediaType === "movie" ? await getMovieDetails(tmdbId) : await getTvDetails(tmdbId);
    } catch (err) {
      // Stale-if-error: a TMDB outage should degrade to slightly-old data,
      // not a 500 — as long as we actually have something stale to serve.
      if (existing) {
        console.warn(
          `[media/cache] TMDB fetch failed for ${mediaType}/${tmdbId}, serving stale row from ${existing.synced_at}:`,
          err instanceof Error ? err.message : err,
        );
        return rowToMedia(existing);
      }

      if (err instanceof TmdbError && err.status === 404) {
        return null;
      }

      throw err;
    }

    // media is a shared cache across all users — ordinary authenticated
    // users only have SELECT on it (see the RLS policy in
    // supabase/migrations/0001_initial_schema.sql). Writes must go through
    // the service-role client, which bypasses RLS (CLAUDE.md architectural
    // rule #4).
    const { data: upserted, error: writeError } = await supabaseAdmin
      .from("media")
      .upsert({ ...fresh, synced_at: new Date().toISOString() }, { onConflict: "tmdb_id,media_type" })
      .select("*")
      .single();

    if (writeError) {
      console.warn(`[media/cache] Upsert failed for ${mediaType}/${tmdbId}:`, writeError.message);
      return fresh;
    }

    return rowToMedia(upserted);
  },
);
