# MyMDB

A private, multi-user personal watch log for films and TV shows — a Letterboxd-style product. You search for a title, open its detail page, and log that you watched it with a rating, a date, and optionally a review. Over time you build up your own library, a diary of viewings, and a watchlist.

Your own data is the product. TMDB (The Movie Database) is only the metadata pipe — it supplies titles, posters, cast, and runtimes; it's never the point of the app. All of your data is private to your account: there are no public profiles, follows, or feeds.

## Features

- **Search** any film or show (live against TMDB) and open a detail page
- **Log viewings** with a half-star rating, a date, a review, and a rewatch flag
- **Library** — everything you've watched / are watching / dropped, with rich sort and filter, in grid or list view
- **Diary** — your viewings grouped by month, newest first
- **Watchlist** — a "what do I watch tonight?" tool with a runtime filter and a **Surprise me** random picker
- **Home dashboard** built entirely from your own data — a stat strip, continue-watching, watchlist preview, and recently-logged rows

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Database + Auth | Supabase (Postgres + Supabase Auth via `@supabase/ssr`) |
| Metadata source | TMDB API v3 endpoints, v4 Bearer token auth |
| Hosting | Vercel |

## Local setup

See **[SETUP.md](./SETUP.md)** for the full walkthrough — creating the Supabase project, getting a TMDB token, populating `.env.local`, running the migrations, and starting the dev server.

The short version:

```bash
npm install
# populate .env.local (see SETUP.md)
# run the migrations in supabase/migrations/ against your Supabase project
npm run dev
```

Then visit [`http://localhost:3000`](http://localhost:3000). In development, `http://localhost:3000/dev/health` runs a foundation health check (environment, Supabase connectivity, TMDB adapter); it returns 404 in production.

## Deployment

MyMDB deploys to Vercel. See the **Deployment** section of [SETUP.md](./SETUP.md) for the full checklist — in brief:

1. Import the repo into Vercel and set the four environment variables.
2. Add your Vercel domain to Supabase's Auth redirect allow-list.
3. Re-enable "Confirm email" in Supabase before going live.

## Project context

`CLAUDE.md` at the repo root holds the full architectural context, the settled product decisions, and the non-negotiable rules (TMDB is server-side only, writes to the shared `media` cache go through the service-role client, every user-owned table is RLS-scoped to `auth.uid()`, ratings are stored as integers 1–10, and so on). Read it before making changes.
