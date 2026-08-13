# MyMDB — Setup

Instructions for getting the app running from a fresh clone. See `CLAUDE.md`
for the full project context and architecture.

## 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project. Give it its own project — this app does not share a Supabase project with anything else.
2. Once it's provisioned, open **Project Settings → Data API** and **Project Settings → API Keys**. You'll need three values from there:

| Key | Where to find it | Goes in |
|---|---|---|
| Project URL | Project Settings → Data API → "Project URL" | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / `public` key | Project Settings → API Keys → "anon public" | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | Project Settings → API Keys → "service_role" (click "Reveal") | `SUPABASE_SERVICE_ROLE_KEY` |

The `service_role` key bypasses Row Level Security entirely. Never expose it to the browser, never prefix it `NEXT_PUBLIC_`, and don't commit it anywhere.

## 2. Get a TMDB v4 Read Access Token

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/).
2. Go to **Settings → API**, and request an API key (choose "Developer").
3. Once approved, the same settings page shows an **API Read Access Token** — a long token under "API Read Access Token (v4 auth)". That's the one this app uses (not the shorter v3 "API Key").

## 3. Populate `.env.local`

Create `.env.local` in the repo root (never commit it) with exactly these variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TMDB_READ_ACCESS_TOKEN=
```

Fill each in with the values from steps 1 and 2.

## 4. Run the migration (Claude runs this step for you)

Claude runs `supabase/migrations/0001_initial_schema.sql` against your project directly with the Supabase CLI (`supabase db push --db-url ...`) — no login or project linking required, just a direct database connection string. That command properly records the migration in Supabase's own migration history table too, unlike a manual SQL Editor paste.

To give Claude what it needs:

1. In the Supabase dashboard, click **Connect** (top of the project page), or go to **Project Settings → Database**.
2. Under **Connection string**, pick the **URI** tab. Prefer the **Session pooler** string — it's IPv4-compatible and works from almost any network. (Use **Direct connection** instead only if you know your network supports IPv6.)
3. Copy the full URI and fill in your actual database password where it shows `[YOUR-PASSWORD]`.
4. Add it to `.env.local` as one extra line — it's not one of the 4 app variables and the app itself never reads it, but keeping it in `.env.local` keeps it out of git and out of the chat:

   ```
   SUPABASE_DB_URL=postgresql://postgres.xxxxx:your-password@aws-0-xxxxx.pooler.supabase.com:5432/postgres
   ```

5. Tell Claude the connection string is in `.env.local` and ask it to run the migration. It will run something like:

   ```bash
   set -a; source .env.local; set +a
   npx supabase db push --db-url "$SUPABASE_DB_URL"
   ```

This creates the `media_type` / `watch_status` enums, the `profiles`, `media`, `user_media`, and `watch_entries` tables, the `handle_new_user()` / `set_updated_at()` triggers, all indexes, and RLS policies. It's meant to be applied once, top to bottom, on a fresh project — if you ever add a second migration file later, the same command re-runs and only applies what's new.

Prefer to do it yourself instead? Open **SQL Editor** in the dashboard, paste the full contents of `supabase/migrations/0001_initial_schema.sql`, and click **Run** — same result, no connection string needed.

## 5. Regenerate database types (Claude can also run this)

`src/lib/supabase/types.ts` is currently hand-written to match the migration above. With the same `SUPABASE_DB_URL` from step 4 still in `.env.local`, Claude can regenerate it directly from the live schema:

```bash
set -a; source .env.local; set +a
npx supabase gen types --db-url "$SUPABASE_DB_URL" --schema public > src/lib/supabase/types.ts
```

Or run it yourself the same way, or via `--project-id <ref>` after `supabase login` if you'd rather not share the DB connection string at all.

## 6. Turn off email confirmation for local development

By default, Supabase requires a user to click a confirmation link before their account is usable — there's no email server configured locally to receive that link, so signup would appear to silently fail.

1. In the Supabase dashboard, go to **Authentication → Sign In / Providers → Email**.
2. Turn **off** "Confirm email".

With it off, `signUp` immediately returns an active session (matching the "sign up → redirect to `/`" behavior described in `CLAUDE.md`), so you can create test accounts without an inbox.

**Before deploying to production, turn "Confirm email" back on.** `src/app/auth/confirm/route.ts` already implements the confirmation callback (`verifyOtp` on `token_hash` + `type`, redirecting to `next` on success or `/login?error=...` on failure), so re-enabling it in the dashboard is the only step needed — no code changes.

## 7. Run the app

```bash
npm install
npm run dev
```

Visit [`http://localhost:3000/dev/health`](http://localhost:3000/dev/health) and confirm all three checks pass:

- **Environment** — all 4 variables above are present.
- **Supabase** — the server client can query the `media` table (row count will be `0` until Stage 3 starts caching titles — that's expected).
- **TMDB** — a search for "blade runner" returns results, rendered as poster cards.

If any check fails, the row shows the actual error text — start there.

Then try the auth flow itself: visit [`http://localhost:3000`](http://localhost:3000) — you should be redirected to `/login` since there's no session yet. Follow the "Sign up" link, create an account, and you should land back on `/` signed in, with the header nav (Library / Diary / Watchlist) and the account menu showing your email's first initial.

> Note: run **every** migration in `supabase/migrations/` in filename order, not just the first. As of Stage 5 that's `0001_initial_schema.sql`, `0002_fix_function_search_path.sql`, and `0003_library_views.sql`. `supabase db push` applies all pending ones automatically; if you're pasting into the SQL Editor, run them one at a time in order. The Library, Diary, Watchlist, and Home pages all read from the `0003` views and will error until it's applied.

## Deployment (Vercel)

MyMDB is a private app deployed to Vercel. Before the first production deploy:

### 1. Set the environment variables in Vercel

In the Vercel project's **Settings → Environment Variables**, add the same four variables from your `.env.local` (do **not** deploy `.env.local` itself — it's gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TMDB_READ_ACCESS_TOKEN=
```

Optionally also set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://mymdb.example.com`) so Open Graph tags and `metadataBase` resolve to absolute URLs. It defaults to `http://localhost:3000` if unset.

`SUPABASE_DB_URL` is only used locally for running migrations and generating types — it does **not** need to be set in Vercel.

### 2. Add the Vercel domain to Supabase's Auth redirect allow-list

Supabase Auth only redirects back to URLs on its allow-list. In the Supabase dashboard, go to **Authentication → URL Configuration**:

- Set the **Site URL** to your production domain (e.g. `https://mymdb.example.com`).
- Under **Redirect URLs**, add your production domain (and, if you use them, Vercel preview URLs like `https://*.vercel.app`).

Without this, email confirmation and any auth redirect will fail in production even though they work locally.

### 3. Re-enable "Confirm email" before going live

In development you turned "Confirm email" **off** (step 6). For production, turn it back **on** — Authentication → Sign In / Providers → Email → enable "Confirm email". The `src/app/auth/confirm/route.ts` handler from Stage 2 already implements the confirmation callback, so no code change is needed; this is a dashboard toggle only. With it on, new signups must click the emailed link before their account is active.

### 4. Deploy

Import the repo into Vercel and deploy. After it's live, confirm:

- Signing up sends a confirmation email, and clicking the link logs you in.
- `/dev/health` returns 404 in production (it's gated to development only).
- `robots.txt` disallows all crawling (the app should not be indexed).
