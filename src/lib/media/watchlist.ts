import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { LibraryRow } from "@/lib/media/library";

type MediaType = Database["public"]["Enums"]["media_type"];

// Mirrors lib/media/library.ts's getLibrary — same user_library view, same
// filter-parsing pattern — but kept as a separate function rather than a
// mode/flag on getLibrary. The Library and Watchlist pages have genuinely
// different filter vocabularies (rating/liked/status/q vs genre/decade/
// maxRuntime) and different sort enums, so a single shared function would
// need an awkward superset of both pages' concerns for little real reuse.

const WATCHLIST_PAGE_SIZE = 48;

const rawParam = z.preprocess(
  (value) => (Array.isArray(value) ? value[0] : value),
  z.string().optional(),
);

const WATCHLIST_SORTS = [
  "added_desc",
  "added_asc",
  "title_asc",
  "year_desc",
  "runtime_asc",
  "tmdb_rating_desc",
] as const;
export type WatchlistSort = (typeof WATCHLIST_SORTS)[number];

const MAX_RUNTIME_VALUES = [90, 120, 150] as const;
export type MaxRuntime = "all" | (typeof MAX_RUNTIME_VALUES)[number];

const watchlistFiltersSchema = z.object({
  type: rawParam.transform((v): "all" | MediaType => (v === "movie" || v === "tv" ? v : "all")),
  genre: rawParam.transform((v) => (v && v.trim() ? v.trim() : null)),
  decade: rawParam.transform((v) => {
    const n = Number(v);
    return v !== undefined && Number.isInteger(n) && n % 10 === 0 ? n : null;
  }),
  maxRuntime: rawParam.transform((v): MaxRuntime => {
    const n = Number(v);
    return (MAX_RUNTIME_VALUES as readonly number[]).includes(n) ? (n as MaxRuntime) : "all";
  }),
  sort: rawParam.transform((v): WatchlistSort =>
    (WATCHLIST_SORTS as readonly string[]).includes(v ?? "") ? (v as WatchlistSort) : "added_desc",
  ),
  page: rawParam.transform((v) => {
    const n = Number(v);
    return v !== undefined && Number.isInteger(n) && n >= 1 ? n : 1;
  }),
});

export type WatchlistFilters = z.infer<typeof watchlistFiltersSchema>;

export function parseWatchlistFilters(
  raw: Record<string, string | string[] | undefined>,
): WatchlistFilters {
  return watchlistFiltersSchema.parse(raw);
}

export function hasActiveWatchlistFilters(filters: WatchlistFilters): boolean {
  return (
    filters.type !== "all" ||
    filters.genre !== null ||
    filters.decade !== null ||
    filters.maxRuntime !== "all"
  );
}

export async function getWatchlist(
  userId: string,
  filters: WatchlistFilters,
): Promise<{ rows: LibraryRow[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("user_library")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "watchlist");

  if (filters.type !== "all") {
    query = query.eq("media_type", filters.type);
  }
  if (filters.genre) {
    query = query.contains("genres", [filters.genre]);
  }
  if (filters.decade !== null) {
    query = query.gte("year", filters.decade).lte("year", filters.decade + 9);
  }
  if (filters.maxRuntime !== "all") {
    // Titles with a null runtime are excluded when a runtime filter is
    // active, not silently included — a null could just as easily be a
    // 3-hour epic TMDB hasn't filled in yet.
    query = query.not("runtime", "is", null).lt("runtime", filters.maxRuntime);
  }

  switch (filters.sort) {
    case "added_desc":
      query = query.order("added_at", { ascending: false });
      break;
    case "added_asc":
      query = query.order("added_at", { ascending: true });
      break;
    case "title_asc":
      query = query.order("title", { ascending: true });
      break;
    case "year_desc":
      query = query.order("year", { ascending: false, nullsFirst: false });
      break;
    case "runtime_asc":
      query = query.order("runtime", { ascending: true, nullsFirst: false });
      break;
    case "tmdb_rating_desc":
      query = query.order("tmdb_rating", { ascending: false, nullsFirst: false });
      break;
  }
  query = query.order("tmdb_id", { ascending: true });

  const from = (filters.page - 1) * WATCHLIST_PAGE_SIZE;
  query = query.range(from, from + WATCHLIST_PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) {
    throw error;
  }

  return { rows: data ?? [], total: count ?? 0 };
}

export interface WatchlistFacets {
  genres: string[];
  decades: number[];
}

export async function getWatchlistFacets(userId: string): Promise<WatchlistFacets> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_library")
    .select("genres, year")
    .eq("user_id", userId)
    .eq("status", "watchlist");

  if (error) {
    throw error;
  }

  const genreSet = new Set<string>();
  let minYear: number | null = null;
  let maxYear: number | null = null;

  for (const row of data ?? []) {
    for (const genre of row.genres) {
      genreSet.add(genre);
    }
    if (row.year !== null) {
      minYear = minYear === null ? row.year : Math.min(minYear, row.year);
      maxYear = maxYear === null ? row.year : Math.max(maxYear, row.year);
    }
  }

  const decades: number[] = [];
  if (minYear !== null && maxYear !== null) {
    const start = Math.floor(minYear / 10) * 10;
    const end = Math.floor(maxYear / 10) * 10;
    for (let d = end; d >= start; d -= 10) {
      decades.push(d);
    }
  }

  return {
    genres: Array.from(genreSet).sort((a, b) => a.localeCompare(b)),
    decades,
  };
}

/**
 * Picks one random title from the watchlist, scoped to the same
 * type/genre/decade/maxRuntime filters currently applied on the page —
 * "filter to under 90m comedy, then roll the dice" is the point. Ignores
 * sort and pagination entirely: randomness doesn't care about display
 * order, and must draw from every matching row, not just the current page.
 * Watchlists are personal-scale, so fetching just the id columns for every
 * match and picking in JS is simple and plenty fast.
 */
export async function pickRandomWatchlistItem(
  userId: string,
  filters: Pick<WatchlistFilters, "type" | "genre" | "decade" | "maxRuntime">,
): Promise<{ tmdbId: number; mediaType: MediaType } | null> {
  const supabase = await createClient();

  let query = supabase
    .from("user_library")
    .select("tmdb_id, media_type")
    .eq("user_id", userId)
    .eq("status", "watchlist");

  if (filters.type !== "all") {
    query = query.eq("media_type", filters.type);
  }
  if (filters.genre) {
    query = query.contains("genres", [filters.genre]);
  }
  if (filters.decade !== null) {
    query = query.gte("year", filters.decade).lte("year", filters.decade + 9);
  }
  if (filters.maxRuntime !== "all") {
    query = query.not("runtime", "is", null).lt("runtime", filters.maxRuntime);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }
  if (!data || data.length === 0) {
    return null;
  }

  const pick = data[Math.floor(Math.random() * data.length)];
  return { tmdbId: pick.tmdb_id, mediaType: pick.media_type };
}

export { WATCHLIST_PAGE_SIZE };
