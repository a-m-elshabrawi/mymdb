-- ============================================================================
-- MyMDB — Stage 1: initial schema
-- ============================================================================
-- Run this once, in order, against a fresh Supabase project (SQL Editor is
-- fine — the Supabase CLI is not assumed to be installed). Safe to read
-- top-to-bottom: enums, tables, triggers, indexes, then RLS policies.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

create type media_type as enum ('movie', 'tv');

create type watch_status as enum ('watchlist', 'watching', 'watched', 'dropped');

-- ----------------------------------------------------------------------------
-- profiles
-- One row per auth user. Created automatically by the handle_new_user()
-- trigger below — never inserted from application code.
-- ----------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- media
-- Shared TMDB metadata cache — one row per title across ALL users. Populated
-- on-demand the first time any user touches a title (Stage 3). Never written
-- to directly by users; only the service-role client upserts here.
-- ----------------------------------------------------------------------------

create table media (
  tmdb_id integer not null,
  media_type media_type not null,
  title text not null,
  original_title text,
  release_date date,
  year smallint, -- denormalised from release_date, for cheap sorting without a date-trunc on every query
  poster_path text, -- TMDB relative path only, e.g. "/abc123.jpg" — never a full URL
  backdrop_path text,
  overview text,
  runtime smallint, -- movies: runtime. tv: average episode runtime
  genres text[] not null default '{}',
  tmdb_rating numeric(3, 1),
  tmdb_vote_count integer,
  number_of_seasons smallint, -- TV only, nullable
  number_of_episodes smallint, -- TV only, nullable
  status text, -- TMDB's own status string: Released, Returning Series, Ended...
  synced_at timestamptz not null default now(), -- drives TTL refresh in Stage 3
  created_at timestamptz not null default now(),
  primary key (tmdb_id, media_type)
);

-- ----------------------------------------------------------------------------
-- user_media
-- The durable user <-> title relationship. One row per user per title.
-- ----------------------------------------------------------------------------

create table user_media (
  user_id uuid not null references auth.users (id) on delete cascade,
  tmdb_id integer not null,
  media_type media_type not null,
  status watch_status not null default 'watchlist',
  rating smallint check (rating between 1 and 10),
  liked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, tmdb_id, media_type),
  foreign key (tmdb_id, media_type) references media (tmdb_id, media_type) on delete cascade
);

-- ----------------------------------------------------------------------------
-- watch_entries
-- The diary — many rows per user per title, one per individual viewing.
-- ----------------------------------------------------------------------------

create table watch_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tmdb_id integer not null,
  media_type media_type not null,
  watched_on date not null default current_date,
  rating smallint check (rating between 1 and 10),
  review text,
  is_rewatch boolean not null default false,
  season_number smallint,
  episode_number smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tmdb_id, media_type) references media (tmdb_id, media_type) on delete cascade
);

comment on column watch_entries.season_number is
  'Intentionally unused in v1. Reserved for post-v1 episode-level tracking so that feature can ship without a schema migration.';
comment on column watch_entries.episode_number is
  'Intentionally unused in v1. Reserved for post-v1 episode-level tracking so that feature can ship without a schema migration.';

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

create index user_media_user_id_status_idx on user_media (user_id, status);
create index user_media_user_id_rating_idx on user_media (user_id, rating) where rating is not null;
create index watch_entries_user_id_watched_on_idx on watch_entries (user_id, watched_on desc);
create index watch_entries_user_id_tmdb_idx on watch_entries (user_id, tmdb_id, media_type);
create index media_genres_gin_idx on media using gin (genres);
create index media_synced_at_idx on media (synced_at);

-- ----------------------------------------------------------------------------
-- Triggers
-- ----------------------------------------------------------------------------

-- set_updated_at(): shared BEFORE UPDATE trigger for any table with an
-- updated_at column.
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on profiles
  for each row
  execute function set_updated_at();

create trigger set_updated_at
  before update on user_media
  for each row
  execute function set_updated_at();

create trigger set_updated_at
  before update on watch_entries
  for each row
  execute function set_updated_at();

-- handle_new_user(): on auth.users insert, create the matching profiles row.
-- username is derived from the email local-part (lowercased, non-alphanumeric
-- stripped). If that's already taken, a short random suffix is appended and
-- retried until it succeeds — handles the race between two signups picking
-- the same local-part.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  candidate_username text;
  attempt int := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));

  if base_username is null or base_username = '' then
    base_username := 'user';
  end if;

  candidate_username := base_username;

  loop
    begin
      insert into public.profiles (id, username)
      values (new.id, candidate_username);
      exit;
    exception when unique_violation then
      attempt := attempt + 1;
      candidate_username := base_username || '_' || substr(md5(random()::text), 1, 6);

      if attempt > 10 then
        raise exception 'handle_new_user: could not generate a unique username for %', new.email;
      end if;
    end;
  end loop;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

alter table profiles enable row level security;
alter table media enable row level security;
alter table user_media enable row level security;
alter table watch_entries enable row level security;

-- profiles: users can read and update only their own row. INSERT is handled
-- exclusively by the handle_new_user() trigger (security definer), so there
-- is no INSERT policy for regular users.
create policy "profiles_select_own"
  on profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- media: shared cache, read-only to authenticated users. No INSERT / UPDATE /
-- DELETE policy is defined on purpose — all writes go through the
-- service-role client (src/lib/supabase/admin.ts), which bypasses RLS
-- entirely. Regular users must never be able to write to this table.
create policy "media_select_authenticated"
  on media for select
  to authenticated
  using (true);

-- user_media: full CRUD, scoped to the owning user.
create policy "user_media_select_own"
  on user_media for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "user_media_insert_own"
  on user_media for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "user_media_update_own"
  on user_media for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "user_media_delete_own"
  on user_media for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- watch_entries: full CRUD, scoped to the owning user.
create policy "watch_entries_select_own"
  on watch_entries for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "watch_entries_insert_own"
  on watch_entries for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "watch_entries_update_own"
  on watch_entries for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "watch_entries_delete_own"
  on watch_entries for delete
  to authenticated
  using (user_id = (select auth.uid()));
