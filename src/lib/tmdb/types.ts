/**
 * Raw TMDB API v3 response shapes — internal to lib/tmdb only.
 * Hand-written for exactly the fields this app uses. Never imported outside
 * lib/tmdb; see mappers.ts for the conversion into app-facing domain types.
 */

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbSearchMovieResult {
  media_type: "movie";
  id: number;
  title: string;
  original_title: string;
  release_date: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
}

export interface TmdbSearchTvResult {
  media_type: "tv";
  id: number;
  name: string;
  original_name: string;
  first_air_date: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
}

export interface TmdbSearchPersonResult {
  media_type: "person";
  id: number;
}

export type TmdbSearchMultiResult =
  | TmdbSearchMovieResult
  | TmdbSearchTvResult
  | TmdbSearchPersonResult;

export interface TmdbSearchMultiResponse {
  page: number;
  results: TmdbSearchMultiResult[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  original_title: string;
  release_date: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  runtime: number | null;
  genres: TmdbGenre[];
  vote_average: number;
  vote_count: number;
  status: string;
}

export interface TmdbTvDetails {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  episode_run_time: number[];
  genres: TmdbGenre[];
  number_of_seasons: number;
  number_of_episodes: number;
  vote_average: number;
  vote_count: number;
  status: string;
}

export interface TmdbErrorResponse {
  status_code: number;
  status_message: string;
  success: false;
}
