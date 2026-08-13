import "server-only";

import type { TmdbErrorResponse } from "./types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  readonly status: number;
  readonly tmdbStatusMessage: string | null;

  constructor(status: number, tmdbStatusMessage: string | null, message: string) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
    this.tmdbStatusMessage = tmdbStatusMessage;
  }
}

type TmdbFetchParams = Record<string, string | number | undefined>;

/**
 * Single fetch helper for every TMDB v3 request. Auth is the v4 Bearer
 * token, never the legacy `api_key` query param. Throws TmdbError for any
 * non-2xx response or network failure — callers don't need try/catch
 * boilerplate around status codes.
 */
export async function tmdbFetch<T>(
  path: string,
  params: TmdbFetchParams = {},
  revalidate = 60 * 60 * 12,
): Promise<T> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (!token) {
    throw new TmdbError(0, null, "Missing environment variable: TMDB_READ_ACCESS_TOKEN");
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      next: { revalidate },
    });
  } catch (cause) {
    throw new TmdbError(
      0,
      null,
      `TMDB request failed: network error reaching ${path}: ${(cause as Error).message}`,
    );
  }

  if (!response.ok) {
    let statusMessage: string | null = null;
    try {
      const body = (await response.json()) as TmdbErrorResponse;
      statusMessage = body.status_message ?? null;
    } catch {
      // Response body wasn't JSON — fall through with statusMessage null.
    }

    switch (response.status) {
      case 401:
        throw new TmdbError(401, statusMessage, "TMDB rejected the read access token (401).");
      case 404:
        throw new TmdbError(404, statusMessage, `TMDB resource not found: ${path}`);
      case 429:
        throw new TmdbError(429, statusMessage, "TMDB rate limit exceeded (429).");
      default:
        throw new TmdbError(
          response.status,
          statusMessage,
          `TMDB request to ${path} failed with status ${response.status}.`,
        );
    }
  }

  return (await response.json()) as T;
}
