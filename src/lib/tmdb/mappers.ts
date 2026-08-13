import type {
  TmdbMovieDetails,
  TmdbSearchMovieResult,
  TmdbSearchTvResult,
  TmdbTvDetails,
} from "./types";

/**
 * App-facing domain types. Nothing outside lib/tmdb should ever see a raw
 * Tmdb* shape — this is the boundary architectural rule #3 in CLAUDE.md
 * refers to. Media mirrors the writable columns of the `media` table.
 */
export interface Media {
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  original_title: string | null;
  release_date: string | null;
  year: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  runtime: number | null;
  genres: string[];
  tmdb_rating: number | null;
  tmdb_vote_count: number | null;
  number_of_seasons: number | null;
  number_of_episodes: number | null;
  status: string | null;
}

export interface MediaSearchResult {
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  year: number | null;
  poster_path: string | null;
  overview: string | null;
}

function yearFromDate(date: string | null): number | null {
  if (!date) {
    return null;
  }
  const year = Number(date.slice(0, 4));
  return Number.isNaN(year) ? null : year;
}

export function mapMovieToMedia(raw: TmdbMovieDetails): Media {
  return {
    tmdb_id: raw.id,
    media_type: "movie",
    title: raw.title,
    original_title: raw.original_title || null,
    release_date: raw.release_date,
    year: yearFromDate(raw.release_date),
    poster_path: raw.poster_path,
    backdrop_path: raw.backdrop_path,
    overview: raw.overview || null,
    runtime: raw.runtime,
    genres: raw.genres.map((genre) => genre.name),
    tmdb_rating: raw.vote_average,
    tmdb_vote_count: raw.vote_count,
    number_of_seasons: null,
    number_of_episodes: null,
    status: raw.status || null,
  };
}

export function mapTvToMedia(raw: TmdbTvDetails): Media {
  return {
    tmdb_id: raw.id,
    media_type: "tv",
    title: raw.name,
    original_title: raw.original_name || null,
    release_date: raw.first_air_date,
    year: yearFromDate(raw.first_air_date),
    poster_path: raw.poster_path,
    backdrop_path: raw.backdrop_path,
    overview: raw.overview || null,
    runtime: raw.episode_run_time[0] ?? null,
    genres: raw.genres.map((genre) => genre.name),
    tmdb_rating: raw.vote_average,
    tmdb_vote_count: raw.vote_count,
    number_of_seasons: raw.number_of_seasons,
    number_of_episodes: raw.number_of_episodes,
    status: raw.status || null,
  };
}

export function mapMovieSearchResult(raw: TmdbSearchMovieResult): MediaSearchResult {
  return {
    tmdb_id: raw.id,
    media_type: "movie",
    title: raw.title,
    year: yearFromDate(raw.release_date),
    poster_path: raw.poster_path,
    overview: raw.overview || null,
  };
}

export function mapTvSearchResult(raw: TmdbSearchTvResult): MediaSearchResult {
  return {
    tmdb_id: raw.id,
    media_type: "tv",
    title: raw.name,
    year: yearFromDate(raw.first_air_date),
    poster_path: raw.poster_path,
    overview: raw.overview || null,
  };
}
