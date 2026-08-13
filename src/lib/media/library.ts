import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type MediaType = Database["public"]["Enums"]["media_type"];
export type LibraryRow = Database["public"]["Views"]["user_library"]["Row"];
export type DiaryEntryRow = Database["public"]["Views"]["diary_entries_view"]["Row"];

const LIBRARY_PAGE_SIZE = 48;
const DIARY_PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Filter parsing — every raw searchParams value is a string, a string[]
// (repeated param), or undefined. Every transform below has an explicit
// fallback branch, so a malformed or unexpected URL degrades to sane
// defaults instead of throwing.
// ---------------------------------------------------------------------------

const rawParam = z.preprocess(
  (value) => (Array.isArray(value) ? value[0] : value),
  z.string().optional(),
);

const LIBRARY_SORTS = [
  "added_desc",
  "watched_desc",
  "title_asc",
  "rating_desc",
  "rating_asc",
  "year_desc",
  "year_asc",
  "runtime_desc",
  "runtime_asc",
] as const;
export type LibrarySort = (typeof LIBRARY_SORTS)[number];

const libraryFiltersSchema = z.object({
  type: rawParam.transform((v): "all" | MediaType => (v === "movie" || v === "tv" ? v : "all")),
  status: rawParam.transform(
    (v): "all" | "watched" | "watching" | "dropped" =>
      v === "watched" || v === "watching" || v === "dropped" ? v : "all",
  ),
  rating: rawParam.transform((v): "all" | "rated" | "unrated" | number => {
    if (v === "rated" || v === "unrated") return v;
    const n = Number(v);
    return v !== undefined && Number.isInteger(n) && n >= 1 && n <= 10 ? n : "all";
  }),
  genre: rawParam.transform((v) => (v && v.trim() ? v.trim() : null)),
  decade: rawParam.transform((v) => {
    const n = Number(v);
    return v !== undefined && Number.isInteger(n) && n % 10 === 0 ? n : null;
  }),
  liked: rawParam.transform((v) => v === "1"),
  q: rawParam.transform((v) => (v ?? "").trim().slice(0, 200)),
  sort: rawParam.transform(
    (v): LibrarySort => ((LIBRARY_SORTS as readonly string[]).includes(v ?? "") ? (v as LibrarySort) : "added_desc"),
  ),
  view: rawParam.transform((v): "grid" | "list" => (v === "list" ? "list" : "grid")),
  page: rawParam.transform((v) => {
    const n = Number(v);
    return v !== undefined && Number.isInteger(n) && n >= 1 ? n : 1;
  }),
});

export type LibraryFilters = z.infer<typeof libraryFiltersSchema>;

export function parseLibraryFilters(raw: Record<string, string | string[] | undefined>): LibraryFilters {
  return libraryFiltersSchema.parse(raw);
}

export function hasActiveLibraryFilters(filters: LibraryFilters): boolean {
  return (
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.rating !== "all" ||
    filters.genre !== null ||
    filters.decade !== null ||
    filters.liked !== false ||
    filters.q !== ""
  );
}

const diaryFiltersSchema = z.object({
  year: rawParam.transform((v) => {
    const n = Number(v);
    return v !== undefined && Number.isInteger(n) ? n : null;
  }),
  type: rawParam.transform((v): "all" | MediaType => (v === "movie" || v === "tv" ? v : "all")),
  rated: rawParam.transform((v) => v === "1"),
  page: rawParam.transform((v) => {
    const n = Number(v);
    return v !== undefined && Number.isInteger(n) && n >= 1 ? n : 1;
  }),
});

export type DiaryFilters = z.infer<typeof diaryFiltersSchema>;

export function parseDiaryFilters(raw: Record<string, string | string[] | undefined>): DiaryFilters {
  return diaryFiltersSchema.parse(raw);
}

export function hasActiveDiaryFilters(filters: DiaryFilters): boolean {
  return filters.year !== null || filters.type !== "all" || filters.rated !== false;
}

// ---------------------------------------------------------------------------
// getLibrary
// ---------------------------------------------------------------------------

export async function getLibrary(
  userId: string,
  filters: LibraryFilters,
): Promise<{ rows: LibraryRow[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("user_library")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    // The Library page always excludes the watchlist — that has its own
    // page (Stage 6) — regardless of the `status` filter's own value.
    .neq("status", "watchlist");

  if (filters.type !== "all") {
    query = query.eq("media_type", filters.type);
  }
  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.rating === "rated") {
    query = query.not("user_rating", "is", null);
  } else if (filters.rating === "unrated") {
    query = query.is("user_rating", null);
  } else if (typeof filters.rating === "number") {
    query = query.gte("user_rating", filters.rating);
  }
  if (filters.genre) {
    query = query.contains("genres", [filters.genre]);
  }
  if (filters.decade !== null) {
    query = query.gte("year", filters.decade).lte("year", filters.decade + 9);
  }
  if (filters.liked) {
    query = query.eq("liked", true);
  }
  if (filters.q) {
    query = query.ilike("title", `%${filters.q}%`);
  }

  // Nulls always sort last, regardless of direction — an unrated film must
  // not lead a rating-descending list. nullsFirst: false is explicit on
  // every nullable column in both directions rather than relying on
  // Postgres's per-direction default (which flips: NULLS LAST is the
  // default for ASC, but NULLS FIRST is the default for DESC).
  switch (filters.sort) {
    case "added_desc":
      query = query.order("added_at", { ascending: false });
      break;
    case "watched_desc":
      query = query.order("last_watched_on", { ascending: false, nullsFirst: false });
      break;
    case "title_asc":
      query = query.order("title", { ascending: true });
      break;
    case "rating_desc":
      query = query.order("user_rating", { ascending: false, nullsFirst: false });
      break;
    case "rating_asc":
      query = query.order("user_rating", { ascending: true, nullsFirst: false });
      break;
    case "year_desc":
      query = query.order("year", { ascending: false, nullsFirst: false });
      break;
    case "year_asc":
      query = query.order("year", { ascending: true, nullsFirst: false });
      break;
    case "runtime_desc":
      query = query.order("runtime", { ascending: false, nullsFirst: false });
      break;
    case "runtime_asc":
      query = query.order("runtime", { ascending: true, nullsFirst: false });
      break;
  }
  // Stable tiebreaker — without one, rows with equal sort keys can shuffle
  // between identical requests, which corrupts pagination.
  query = query.order("tmdb_id", { ascending: true });

  const from = (filters.page - 1) * LIBRARY_PAGE_SIZE;
  query = query.range(from, from + LIBRARY_PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) {
    throw error;
  }

  return { rows: data ?? [], total: count ?? 0 };
}

/**
 * Cheap head-count of the library's unfiltered baseline (status != watchlist,
 * no other filters) — used only to render "84 of 210 titles" when filters
 * are active. head: true means no rows are actually transferred.
 */
export async function getLibraryBaselineTotal(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("user_library")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("status", "watchlist");

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export interface LibraryFacets {
  genres: string[];
  decades: number[];
}

export async function getLibraryFacets(userId: string): Promise<LibraryFacets> {
  const supabase = await createClient();

  // TODO: flattening genre arrays in JS is fine at this scale. If libraries
  // grow large, replace with an RPC that does `unnest(genres)` + DISTINCT
  // server-side instead of shipping every row's genre array to the client.
  const { data, error } = await supabase
    .from("user_library")
    .select("genres, year")
    .eq("user_id", userId)
    .neq("status", "watchlist");

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

// ---------------------------------------------------------------------------
// getDiary
// ---------------------------------------------------------------------------

export async function getDiary(
  userId: string,
  filters: DiaryFilters,
): Promise<{ entries: DiaryEntryRow[]; total: number }> {
  const supabase = await createClient();

  let query = supabase.from("diary_entries_view").select("*", { count: "exact" }).eq("user_id", userId);

  if (filters.year !== null) {
    query = query.gte("watched_on", `${filters.year}-01-01`).lte("watched_on", `${filters.year}-12-31`);
  }
  if (filters.type !== "all") {
    query = query.eq("media_type", filters.type);
  }
  if (filters.rated) {
    query = query.not("entry_rating", "is", null);
  }

  query = query
    .order("watched_on", { ascending: false })
    .order("created_at", { ascending: false });

  const from = (filters.page - 1) * DIARY_PAGE_SIZE;
  query = query.range(from, from + DIARY_PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) {
    throw error;
  }

  return { entries: data ?? [], total: count ?? 0 };
}

export async function getDiaryFacets(userId: string): Promise<{ years: number[] }> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("diary_entries_view").select("watched_on").eq("user_id", userId);

  if (error) {
    throw error;
  }

  const yearSet = new Set<number>();
  for (const row of data ?? []) {
    yearSet.add(Number(row.watched_on.slice(0, 4)));
  }

  return { years: Array.from(yearSet).sort((a, b) => b - a) };
}

export { LIBRARY_PAGE_SIZE, DIARY_PAGE_SIZE };
