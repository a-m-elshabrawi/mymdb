# MyMDB — Project Context

> Drop this file at the repo root as `CLAUDE.md`. Claude Code reads it automatically on every session, so it does not need to be re-pasted.

---

## What this is

**MyMDB** is a private, multi-user personal watch log for films and TV shows — a Letterboxd-style product, built from scratch.

The user's own data is the product: what they watched, when, how they rated it, what they thought, and what they intend to watch next. TMDB (The Movie Database) is purely the metadata pipe — it supplies titles, posters, cast, runtimes. It is never the point of the app.

**What a user does here:** searches for a film or show → opens its detail page → logs that they watched it, with a rating, a date, and optionally a review → later browses their own collection, their diary of viewings, and their watchlist.

**What this is not:** not a streaming-availability tracker, not a public social network, not a TMDB browsing skin.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.x, App Router, TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Database + Auth | Supabase (Postgres, Supabase Auth via `@supabase/ssr`) |
| Metadata source | TMDB API v3 endpoints, v4 Bearer token auth |
| Hosting | Vercel |
| Charts (later stages) | Recharts |

Supabase lives in its own dedicated project — it is **not** shared with any other app.

---

## Product decisions (already settled — do not relitigate)

| Area | Decision |
|---|---|
| **Core loop** | Search → detail → log → your library |
| **Naming** | The "Films" grid/nav item was renamed to "Library" in Stage 5 — the route is `/library`, not `/films`. It holds everything with a status other than `watchlist` (watched/watching/dropped); the watchlist has its own page. |
| **TV depth** | Title-level logging only in v1. No episode checkboxes. Schema is pre-shaped so episodes can be added later without a migration. |
| **Data strategy** | Cache-on-demand. The first time any title is touched, upsert it into a local `media` table. List pages join locally — zero TMDB calls. Live *search* still hits TMDB. |
| **Log model** | Two tables. `user_media` holds the durable relationship (one row per user per title). `watch_entries` holds each individual viewing (many rows). |
| **Audience** | Public signup; all data private to the account. No public profiles, no follows, no feed. |
| **v1 scope** | Core loop + watchlist + diary. **Not** in v1: custom lists, stats/insights page, discover/trending home, CSV import, social. |
| **Rating scale** | 0.5–5.0 stars in half-star steps. Stored as `smallint` 1–10 to avoid float comparison bugs. Rendered as stars. |
| **Design** | Poster-forward dark. Near-black background, minimal chrome, artwork supplies the colour. |

---

## Architectural rules

These are non-negotiable and apply to every stage.

1. **TMDB is server-side only.** Every TMDB request happens in a Server Component, Server Action, or Route Handler. The token is `TMDB_READ_ACCESS_TOKEN` — never prefixed `NEXT_PUBLIC_`, never reachable from the browser.

2. **All TMDB access goes through `lib/tmdb/`.** No component anywhere calls `fetch('https://api.themoviedb.org/...')` directly. `lib/tmdb/index.ts` is the only public surface, and it is the designated seam for swapping metadata providers later.

3. **TMDB shapes never leak past the adapter.** `lib/tmdb/mappers.ts` converts raw TMDB responses into the app's own domain types before anything else sees them. Application code must not know what `poster_path` or `episode_run_time` mean.

4. **Writes to `media` use the service-role client.** `media` is a shared cache across all users, so ordinary authenticated users get read-only access to it. Cache upserts run server-side with the admin client.

5. **Every user-owned table is protected by RLS,** scoped to `auth.uid()`. No exceptions, no "we'll add it later".

6. **Ratings are integers 1–10 everywhere in the data layer.** Convert to and from half-stars only at the presentation boundary. Never store 4.5.

7. **TMDB attribution renders in the footer on every page.** This is a licence condition, not a design nicety. Required text: *"This product uses the TMDB API but is not endorsed or certified by TMDB."* accompanied by the TMDB logo.

8. **Composite keys are `(tmdb_id, media_type)`,** always together. A movie and a TV show can share the same numeric TMDB id — treating `tmdb_id` alone as unique is a data-corruption bug waiting to happen.

---

## Environment

`.env.local` is populated manually by the user with real keys.

**Never create, recreate, or modify `.env.local.example` or `.env.example`** unless explicitly asked. Do not overwrite `.env.local`.

Expected variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TMDB_READ_ACCESS_TOKEN=
```

---

## Working style

- **Flag ambiguous architectural decisions before proceeding.** If a requirement is underspecified — especially around date boundaries, status transitions, rewatch semantics, or rating aggregation — stop and ask. Do not make a silent assumption and build on it.
- Work strictly within the current stage's scope. Do not build ahead into later stages, even where it seems obvious.
- Prefer Server Components. Reach for `"use client"` only where interactivity genuinely requires it.
- TypeScript strict mode. No `any`. Database types are generated from Supabase, not hand-written.

---

## Stage plan

| Stage | Contents | Status |
|---|---|---|
| 1 | Scaffold, design tokens, Supabase schema + RLS, TMDB adapter, health check, SETUP.md | done |
| 2 | Auth — signup, login, logout, route protection middleware, nav shell | done |
| 3 | Search + title detail page, `media` cache-on-demand upsert | done |
| 4 | Logging — rating, date, review, rewatch; `user_media` state transitions | done |
| 5 | Your Library grid (sort/filter) + Diary view | done |
| 6 | Watchlist, home dashboard, empty/loading/error states, a11y + production polish | done |

**v1 is complete.** All six stages shipped.

## v2 candidates (deferred, intentionally)

These were consciously scoped out of v1 — recorded here so the decisions stay visible rather than being rediscovered later:

- **Episode-level TV tracking.** v1 is title-level only. The schema is already pre-shaped for it: `watch_entries.season_number` / `episode_number` exist and are unused, so this can ship without a migration.
- **Custom lists.** User-curated lists of titles (e.g. "best noir", "to watch with friends"), separate from the watchlist. Needs new tables.
- **Stats / insights page.** Charts over the user's own data — viewing counts over time, rating distribution, most-watched genres/decades. Recharts is already in the dependency list for this.
- **CSV import.** Bulk-import viewing history (e.g. a Letterboxd export) — the highest-effort item, needs careful title-matching against TMDB.

---

## Next.js 16 notes

The following changed in recent majors and are a common source of errors — get them right the first time:

- `params` and `searchParams` in pages and layouts are **Promises**. They must be awaited.
- `cookies()` and `headers()` from `next/headers` are **async**.
- `@supabase/ssr` cookie handling uses the `getAll` / `setAll` interface. The older `get` / `set` / `remove` trio is deprecated — do not use it.
- Turbopack is the default dev bundler.
- Tailwind v4 configures via CSS (`@theme`), not `tailwind.config.js`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
