/**
 * Formats a Postgres `date` column (e.g. watched_on = "2026-08-12") as
 * "12 Aug 2026".
 *
 * `new Date("2026-08-12")` parses as UTC midnight. Handing that straight to
 * `.toLocaleDateString()` then renders it in the *viewer's* local timezone,
 * so anyone west of UTC sees the previous day. Parse the string's own
 * year/month/day parts directly instead — the displayed date then always
 * matches exactly what's stored, regardless of the viewer's timezone.
 *
 * Do not use `new Date(dateString).toLocaleDateString()` on a date-only
 * column. Use this everywhere a `date` column is rendered.
 */
export function formatDateOnly(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Formats a Postgres `timestamptz` column (e.g. user_media.created_at) in
 * the same "12 Aug 2026" shape as formatDateOnly. Unlike a bare `date`
 * column, a timestamptz string already carries an explicit UTC offset, so
 * `new Date()` parses it unambiguously — there's no equivalent gotcha to
 * work around here.
 */
export function formatTimestamp(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Formats a "YYYY-MM" key as "August 2026", for the Diary's month headings. */
export function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** Formats runtime minutes as "2h 22m" (movies) or "~48m per episode" (TV). */
export function formatRuntime(runtime: number | null, mediaType: "movie" | "tv"): string | null {
  if (runtime === null) {
    return null;
  }

  if (mediaType === "movie") {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  return `~${runtime}m per episode`;
}
