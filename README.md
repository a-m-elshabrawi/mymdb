# MyMDB

A private watch log for films and television. You search a title, log that you watched it
with a rating and a date, and over time you build a library, a diary and a watchlist that
belong to you.

**Status** v1 complete, all six stages shipped
**Built** August 2026

## Try it

Live at **<https://mymdb-amber.vercel.app>**. There is a public demo account with a
populated log, so you can see the product without signing up.

| | |
|---|---|
| Email | `demo@mymdb.app` |
| Password | `watchlog-demo-2026` |

The demo log holds 67 titles: 44 watched, 3 shows in progress, 2 dropped and 18 on the
watchlist, with 52 diary entries spread over 15 months, 32 of them carrying a written
review and 4 marked as rewatches. Ratings run from 3 to 5 stars across 21 genres and 7
decades, and the watchlist has titles in each of its runtime buckets, so the library
sorting, the diary's month grouping, the watchlist's random picker and the dashboard stats
all have something real to work on instead of an empty state.

The demo account is an ordinary account with ordinary permissions, so anything a visitor
changes there sticks. `npm run seed:demo` resets it: it deletes every row the demo user
owns, rewrites them from `scripts/demo-data.ts`, refreshes the metadata from TMDB and
reissues the password above. Viewing dates are stored as offsets from the run date rather
than fixed calendar dates, so a reseed always produces a log that runs up to today.

Nothing about the demo account is special-cased. It is scoped by the same RLS policies as
every other account, so signing in as the demo user shows the demo user's log and nothing
else.

## Why this exists

Your own data is the product. What you watched, when, how you rated it, what you thought,
and what you mean to watch next. TMDB supplies titles, posters, cast and runtimes, and it
is never the point of the app.

That distinction drove most of the architecture. If the metadata is a pipe rather than the
product, it belongs behind an adapter, it belongs on the server, and it should be possible
to replace it without touching a single page component.

## What it does

Search any film or show live against TMDB and open its detail page. Log a viewing with a
half-star rating, a date, an optional review and a rewatch flag. Browse your library with
sorting and filtering in grid or list view, read your diary grouped by month, and keep a
watchlist with a runtime filter and a random picker for when you cannot decide.

## Stack and rationale

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router, TypeScript strict | Server Components let TMDB calls stay on the server by default rather than by discipline |
| Styling | Tailwind CSS v4 | Configured in CSS via `@theme`. One less config file to keep in sync |
| Components | shadcn/ui | Copied into the repo rather than installed, so I can edit a component instead of fighting its props |
| Database and auth | Supabase, Postgres with Supabase Auth via `@supabase/ssr` | Postgres row level security does the isolation work in the database rather than in my query code |
| Metadata | TMDB API, v3 endpoints with v4 Bearer auth | Good artwork, a free tier, and a licence that permits this use provided attribution is rendered |
| Hosting | Vercel | Matches the framework, and preview deploys per branch |

Supabase runs in its own project rather than sharing one with anything else, so a mistake
here cannot reach another app's data.

## Design decisions

1. **TMDB is server-side only, always.** Every request happens in a Server Component,
   Server Action or Route Handler. The token is `TMDB_READ_ACCESS_TOKEN` and is never
   prefixed `NEXT_PUBLIC_`. A key in the browser is a key that has been given away.

2. **All TMDB access goes through `lib/tmdb/`.** No component calls the API directly.
   `lib/tmdb/index.ts` is the only public surface and the designated seam for swapping
   providers later.

3. **TMDB shapes never leak past the adapter.** `lib/tmdb/mappers.ts` converts raw
   responses into domain types first. Application code does not know what `poster_path` or
   `episode_run_time` mean, which is what makes decision 2 worth anything.

4. **Ratings are stored as `smallint` 1 to 10, rendered as half-stars.** Storing 4.5 as a
   float invites comparison and equality bugs that surface months later in a sort order
   nobody can explain. Conversion happens only at the presentation boundary.

5. **Composite keys are `(tmdb_id, media_type)`, always together.** Films and television
   are numbered in separate sequences, so the same integer can identify one of each.
   Treating `tmdb_id` alone as unique is a data corruption bug waiting for the right pair
   of ids. This was written down as a rule before anything was built, which is the only
   reason it never became one.

6. **Cache on demand rather than syncing a catalogue.** The first time any title is
   touched it is upserted into a local `media` table. List pages then join locally and make
   zero TMDB calls. Only live search hits the API.

7. **Writes to `media` use the service-role client.** `media` is a cache shared by all
   users, so ordinary authenticated users get read-only access to it and upserts run
   server-side with the admin client.

8. **Two tables model a log, not one.** `user_media` holds the durable relationship, one
   row per user per title. `watch_entries` holds each individual viewing, many rows. A
   rewatch is a new entry, not an edit.

## How the metadata cache works

1. A user searches. The query goes to a Server Action, which calls `lib/tmdb/` and returns
   mapped domain objects. Nothing is written yet.
2. The user opens a title's detail page. That is the first "touch", so the mapped record is
   upserted into `media` keyed on `(tmdb_id, media_type)` using the service-role client.
3. Any subsequent read of that title, on the library grid, the diary or the watchlist,
   joins against `media` locally.
4. TMDB is therefore hit once per title per lifetime of the cache, plus once per search.

The reason this matters is rate limits and latency. A library page showing 60 posters would
otherwise be 60 API calls on every render.

## Data model

`media` is the shared metadata cache, read-only to users, keyed on the composite
`(tmdb_id, media_type)`.

`user_media` is one row per user per title, holding the durable relationship: the status
(`watched`, `watching`, `dropped`, `watchlist`) for that title.

`watch_entries` is one row per viewing, holding date, review, rewatch flag, and the unused
`season_number` and `episode_number` columns that let episode-level tracking ship later
without a migration.

Every user-owned table has row level security enabled and scoped to `auth.uid()`. No
exceptions, and none added later.

## What this is and is not

It is a genuinely multi-user application. Public signup works, and each account's data is
isolated by row level security in Postgres rather than by application logic.

It is not a social product and will not become one. There are no public profiles, no
follows and no feed, by decision rather than by omission. It is also not a streaming
availability tracker, and it is not a TMDB browsing skin.

TV is tracked at title level only in v1. There are no episode checkboxes.

## Known limitations

**The `media` cache never refreshes.** A title upserted on first touch keeps whatever TMDB
returned that day. Posters, runtimes and titles do occasionally change upstream, and
nothing here notices. A staleness timestamp with a periodic refresh is the fix.

**Search always hits TMDB.** Cache-on-demand covers list pages, but live search is a
request per query by design. It is fine at this scale and it is the first thing that would
run into rate limits under real traffic.

**No CSV import.** Which means the app is only useful to someone starting from zero, and
anyone with a Letterboxd history cannot bring it. This is the single biggest barrier to
anyone else actually using it, and it is deferred rather than solved.

## Running it locally

See [SETUP.md](./SETUP.md) for the full walkthrough: creating the Supabase project,
getting a TMDB token, populating `.env.local`, running the migrations and starting the dev
server.

```bash
npm install
# populate .env.local, then run supabase/migrations/ against your project
npm run dev
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client, constrained by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Writes to the shared `media` cache |
| `TMDB_READ_ACCESS_TOKEN` | v4 Bearer token. Server-only, never `NEXT_PUBLIC_` |

In development, `/dev/health` runs a foundation check covering environment, Supabase
connectivity and the TMDB adapter. It returns 404 in production.

## Deploying

Import into Vercel and set the four environment variables. Add the Vercel domain to
Supabase's auth redirect allow-list. Re-enable "Confirm email" in Supabase before going
live, because it is off during development.

## Project structure

```
app/
  (marketing)/      Public landing page at /, its own header, the only indexable route
  (app)/            Authenticated shell. Dashboard at /home, plus /library /diary /watchlist
lib/
  tmdb/             The only place TMDB is called. index.ts is the public surface,
                    mappers.ts converts raw responses to domain types
  supabase/         Browser, server and admin clients kept separate on purpose
scripts/
  seed-demo.ts      Resets the public demo account. demo-data.ts is its catalogue
supabase/
  migrations/       Incremental schema changes
middleware.ts       Auth routing. / is exempt, gated routes redirect to /login?next=
```

## AI usage disclosure

Claude Code was used throughout development, guided by a `CLAUDE.md` at the repo root that
holds the settled product decisions and the architectural rules reproduced above. All
generated code was reviewed before use. The shipped product does not call any model at
runtime.

## Licence and attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. That text and the
TMDB logo render in the footer on every page, which is a licence condition rather than a
design choice.
