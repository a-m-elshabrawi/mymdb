/**
 * Public surface for all TMDB access. Nothing outside lib/tmdb should import
 * from client.ts, types.ts, or mappers.ts directly — this file is the
 * designated seam for swapping metadata providers later (CLAUDE.md,
 * architectural rule #2).
 */
import "server-only";

import { tmdbFetch, TmdbError } from "./client";
import { tmdbImageUrl } from "./images";
import {
  mapMovieSearchResult,
  mapMovieToMedia,
  mapTvSearchResult,
  mapTvToMedia,
} from "./mappers";
import type {
  TmdbMovieDetails,
  TmdbSearchMultiResponse,
  TmdbTvDetails,
} from "./types";

import type { Media, MediaSearchResult } from "./mappers";

export type { Media, MediaSearchResult };
export { TmdbError, tmdbImageUrl };
export type { TmdbPosterSize, TmdbBackdropSize } from "./images";

export interface SearchMultiResult {
  results: MediaSearchResult[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export async function searchMulti(query: string, page = 1): Promise<SearchMultiResult> {
  const response = await tmdbFetch<TmdbSearchMultiResponse>("/search/multi", { query, page });

  const mapped = response.results
    .filter((result) => result.media_type === "movie" || result.media_type === "tv")
    .map((result) =>
      result.media_type === "movie" ? mapMovieSearchResult(result) : mapTvSearchResult(result),
    );

  // Stable partition: items with a poster rank first, preserving TMDB's
  // relative order within each group. TMDB's raw ordering otherwise
  // surfaces a lot of posterless obscurities near the top, which makes the
  // grid look broken.
  const withPoster = mapped.filter((item) => item.poster_path !== null);
  const withoutPoster = mapped.filter((item) => item.poster_path === null);

  return {
    results: [...withPoster, ...withoutPoster],
    page: response.page,
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

export async function getMovieDetails(tmdbId: number): Promise<Media> {
  const response = await tmdbFetch<TmdbMovieDetails>(`/movie/${tmdbId}`);
  return mapMovieToMedia(response);
}

export async function getTvDetails(tmdbId: number): Promise<Media> {
  const response = await tmdbFetch<TmdbTvDetails>(`/tv/${tmdbId}`);
  return mapTvToMedia(response);
}
