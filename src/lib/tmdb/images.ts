const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type TmdbPosterSize = "w185" | "w342" | "w500" | "original";
export type TmdbBackdropSize = "w780" | "w1280";

/**
 * Builds a full TMDB image URL from a stored relative path. Returns null for
 * a null path so callers can fall back to a placeholder instead of rendering
 * a broken image.
 */
export function tmdbImageUrl(
  path: string | null,
  size: TmdbPosterSize | TmdbBackdropSize,
): string | null {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}
