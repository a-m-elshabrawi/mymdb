/**
 * Resets the public demo account to a known state.
 *
 *   npm run seed:demo
 *
 * Safe to re-run: the demo user is logged in publicly (README → "Try it"),
 * and RLS deliberately lets it edit its own rows, so visitors will change
 * the data. This script wipes every user_media and watch_entries row owned
 * by the demo user and rewrites them from scripts/demo-data.ts.
 *
 * It is destructive *only* for the demo user — every delete below is
 * filtered on that one user id. It never touches another account's rows,
 * and it never deletes from the shared `media` cache.
 *
 * Runs outside the Next.js runtime, so it is invoked through tsx with
 * `--conditions=react-server`; that makes the `server-only` marker resolve
 * to its empty build and lets this script import the real TMDB adapter
 * (`@/lib/tmdb`) and the real service-role client (`@/lib/supabase/admin`)
 * instead of reimplementing either. TMDB responses therefore still pass
 * through lib/tmdb/mappers.ts before anything here sees them (CLAUDE.md
 * architectural rules #2 and #3), and every write to `media` goes through
 * the service-role client (rule #4).
 */
import type { User } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { getMovieDetails, getTvDetails, type Media } from "@/lib/tmdb";

import { DEMO_TITLES, type DemoTitle } from "./demo-data";

// These are intentionally public — they ship in README.md so a visitor can
// look at the product without signing up. Nothing here is a secret.
export const DEMO_EMAIL = "demo@mymdb.app";
export const DEMO_PASSWORD = "watchlog-demo-2026";

const TMDB_CONCURRENCY = 6;

type UserMediaInsert = Database["public"]["Tables"]["user_media"]["Insert"];
type WatchEntryInsert = Database["public"]["Tables"]["watch_entries"]["Insert"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RUN_AT = new Date();

/** `daysAgo` → a YYYY-MM-DD date string, resolved against the seed run time. */
function dateDaysAgo(daysAgo: number): string {
  const d = new Date(RUN_AT);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/** `daysAgo` → a full timestamptz, for created_at / updated_at columns. */
function timestampDaysAgo(daysAgo: number): string {
  const d = new Date(RUN_AT);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// Validation — catches a bad edit to demo-data.ts before it reaches the DB
// ---------------------------------------------------------------------------

function validate(titles: DemoTitle[]): void {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const title of titles) {
    const key = `${title.mediaType}:${title.tmdbId}`;
    if (seen.has(key)) {
      problems.push(`${title.label}: duplicate (tmdb_id, media_type) — user_media is keyed on it`);
    }
    seen.add(key);

    if (title.mediaType === "movie" && title.status === "watching") {
      problems.push(`${title.label}: movies have no "watching" state (see setStatus in lib/actions/log.ts)`);
    }

    const watches = title.watches ?? [];

    if (title.status === "watchlist" && (watches.length > 0 || title.rating != null)) {
      problems.push(`${title.label}: a watchlist item must have no viewings and no rating`);
    }

    if (title.status === "watched" && watches.length === 0 && title.rating == null) {
      problems.push(`${title.label}: marked watched but has neither a viewing nor a rating`);
    }

    for (const watch of watches) {
      if (watch.rating !== null && (!Number.isInteger(watch.rating) || watch.rating < 1 || watch.rating > 10)) {
        problems.push(`${title.label}: rating ${watch.rating} is not an integer 1–10 (CLAUDE.md rule #6)`);
      }
      if (watch.daysAgo < 0) {
        problems.push(`${title.label}: viewing is in the future (daysAgo ${watch.daysAgo})`);
      }
      if (watch.daysAgo > title.addedDaysAgo) {
        problems.push(
          `${title.label}: viewing ${watch.daysAgo}d ago predates the library row added ${title.addedDaysAgo}d ago`,
        );
      }
    }

    // A rewatch has to come after a first watch, and the earliest viewing
    // must not be flagged as one.
    const ordered = [...watches].sort((a, b) => b.daysAgo - a.daysAgo);
    if (ordered.length > 0 && ordered[0].isRewatch) {
      problems.push(`${title.label}: the earliest viewing is flagged as a rewatch`);
    }
    if (ordered.length > 1 && ordered.slice(1).some((w) => !w.isRewatch)) {
      problems.push(`${title.label}: a viewing after the first is not flagged as a rewatch`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`demo-data.ts is inconsistent:\n  - ${problems.join("\n  - ")}`);
  }
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

/**
 * Finds the demo user by email, creating it if it doesn't exist. An existing
 * demo user has its password reset and its email re-confirmed, so the
 * credentials in README.md are always the working ones even if someone has
 * changed them through the UI.
 */
async function ensureDemoUser(): Promise<User> {
  let page = 1;
  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const existing = data.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);
    if (existing) {
      const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existing.id,
        { password: DEMO_PASSWORD, email_confirm: true },
      );
      if (updateError) throw updateError;
      console.log(`  demo user found, credentials reset  (${existing.id})`);
      return updated.user;
    }

    if (data.users.length < 200) break;
    page += 1;
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (createError) throw createError;

  console.log(`  demo user created  (${created.user.id})`);
  return created.user;
}

/**
 * Clears everything the demo user owns. Both deletes are scoped to the demo
 * user id; watch_entries goes first because user_media rows are what the
 * Library reads from, and a half-applied reset should leave the account
 * empty rather than showing entries with no library row.
 */
async function resetDemoData(userId: string): Promise<void> {
  const { error: entriesError, count: entriesDeleted } = await supabaseAdmin
    .from("watch_entries")
    .delete({ count: "exact" })
    .eq("user_id", userId);
  if (entriesError) throw entriesError;

  const { error: userMediaError, count: userMediaDeleted } = await supabaseAdmin
    .from("user_media")
    .delete({ count: "exact" })
    .eq("user_id", userId);
  if (userMediaError) throw userMediaError;

  console.log(`  cleared ${entriesDeleted ?? 0} watch entries, ${userMediaDeleted ?? 0} library rows`);
}

/**
 * Populates the shared `media` cache for every title in the catalogue.
 * user_media and watch_entries both carry a composite FK to media, so this
 * has to succeed before any user row is inserted.
 */
async function cacheMedia(titles: DemoTitle[]): Promise<void> {
  const fetched = await mapWithConcurrency(titles, TMDB_CONCURRENCY, async (title) => {
    try {
      return title.mediaType === "movie"
        ? await getMovieDetails(title.tmdbId)
        : await getTvDetails(title.tmdbId);
    } catch (cause) {
      throw new Error(
        `TMDB lookup failed for ${title.label} (${title.mediaType}/${title.tmdbId}): ${(cause as Error).message}`,
      );
    }
  });

  // Guard against a transposed or mistyped id in demo-data.ts silently
  // seeding the wrong film.
  const mismatches = fetched
    .map((media, i) => ({ media, title: titles[i] }))
    .filter(({ media, title }) => media.media_type !== title.mediaType);
  if (mismatches.length > 0) {
    throw new Error(
      `TMDB returned the wrong media type for: ${mismatches.map(({ title }) => title.label).join(", ")}`,
    );
  }

  const rows = fetched.map((media: Media) => ({ ...media, synced_at: RUN_AT.toISOString() }));

  const { error } = await supabaseAdmin
    .from("media")
    .upsert(rows, { onConflict: "tmdb_id,media_type" });
  if (error) throw error;

  console.log(`  cached ${rows.length} media rows from TMDB`);
}

/**
 * Writes the library rows and the diary.
 *
 * `user_media.rating` is derived from the most recent viewing that carries a
 * rating — the same rule updateEntry() in lib/actions/log.ts applies when a
 * user edits an entry — so the seeded state is one the real UI could have
 * produced, not a shape only the seeder can create.
 */
async function insertDemoData(userId: string, titles: DemoTitle[]): Promise<void> {
  const userMediaRows: UserMediaInsert[] = [];
  const watchEntryRows: WatchEntryInsert[] = [];

  for (const title of titles) {
    const watches = [...(title.watches ?? [])].sort((a, b) => b.daysAgo - a.daysAgo);
    const latestRated = [...watches].reverse().find((w) => w.rating !== null);
    const rating = watches.length > 0 ? (latestRated?.rating ?? null) : (title.rating ?? null);

    // The most recent viewing is what the user last did with this title;
    // for a watchlist item, adding it is. Drives "continue watching" order.
    const touchedDaysAgo = watches.length > 0 ? watches[watches.length - 1].daysAgo : title.addedDaysAgo;

    userMediaRows.push({
      user_id: userId,
      tmdb_id: title.tmdbId,
      media_type: title.mediaType,
      status: title.status,
      rating,
      liked: title.liked ?? false,
      created_at: timestampDaysAgo(title.addedDaysAgo),
      updated_at: timestampDaysAgo(touchedDaysAgo),
    });

    for (const watch of watches) {
      watchEntryRows.push({
        user_id: userId,
        tmdb_id: title.tmdbId,
        media_type: title.mediaType,
        watched_on: dateDaysAgo(watch.daysAgo),
        rating: watch.rating,
        review: watch.review ?? null,
        is_rewatch: watch.isRewatch ?? false,
        created_at: timestampDaysAgo(watch.daysAgo),
        updated_at: timestampDaysAgo(watch.daysAgo),
      });
    }
  }

  const { error: userMediaError } = await supabaseAdmin.from("user_media").insert(userMediaRows);
  if (userMediaError) throw userMediaError;

  const { error: entriesError } = await supabaseAdmin.from("watch_entries").insert(watchEntryRows);
  if (entriesError) throw entriesError;

  const byStatus = userMediaRows.reduce<Record<string, number>>((acc, row) => {
    const status = row.status ?? "watchlist";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`  inserted ${userMediaRows.length} library rows: ${
    Object.entries(byStatus)
      .map(([status, count]) => `${count} ${status}`)
      .join(", ")
  }`);
  console.log(
    `  inserted ${watchEntryRows.length} diary entries (${
      watchEntryRows.filter((r) => r.review).length
    } with a review, ${watchEntryRows.filter((r) => r.is_rewatch).length} rewatches)`,
  );

  const dates = watchEntryRows.map((r) => r.watched_on as string).sort();
  console.log(`  diary spans ${dates[0]} → ${dates[dates.length - 1]}`);
}

// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding the MyMDB demo account\n");

  validate(DEMO_TITLES);
  console.log(`  catalogue validated: ${DEMO_TITLES.length} titles`);

  const user = await ensureDemoUser();
  await resetDemoData(user.id);
  await cacheMedia(DEMO_TITLES);
  await insertDemoData(user.id, DEMO_TITLES);

  console.log(`\nDone. Sign in as ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main().catch((error: unknown) => {
  console.error("\nSeed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
