-- ============================================================================
-- MyMDB — Stage 5: flattened views for the Library and Diary pages
-- ============================================================================
-- Both pages sort and filter parent rows by columns that live on `media`
-- (year, genres, ...), and PostgREST's order(..., { referencedTable }) only
-- sorts *within* an embedded resource — it can't order the parent rows.
-- Flattening the join into a view sidesteps that entirely and makes every
-- query on these pages simpler and faster.
--
-- Both views are created WITH (security_invoker = true). That is what makes
-- them safe to expose to `authenticated` without any new RLS policies: a
-- security_invoker view runs with the CALLING user's own privileges, so the
-- existing RLS policies on user_media and watch_entries (scoped to
-- user_id = auth.uid()) still apply exactly as if the caller had queried
-- those tables directly. Do not add RLS policies on these views — there is
-- nothing for them to do; the enforcement already happens on the base
-- tables. (Without security_invoker, Postgres views default to running with
-- the view OWNER's privileges, which would bypass RLS entirely — that's the
-- trap this guards against.)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- user_library
-- user_media inner-joined to media, one row per (user, title) relationship
-- the user actually has an opinion about. Adds last_watched_on — the most
-- recent watch_entries.watched_on for that title, via a LEFT JOIN + MAX() —
-- so the Library grid/list can sort and display "last watched" even though
-- user_media itself carries no viewing date (only watch_entries does).
-- Titles with no logged viewing (e.g. dropped without ever logging a watch)
-- get NULL here; sort as nulls-last in application queries.
-- ----------------------------------------------------------------------------

create view user_library
with (security_invoker = true) as
select
  um.user_id,
  um.tmdb_id,
  um.media_type,
  um.status,
  um.rating as user_rating,
  um.liked,
  um.created_at as added_at,
  um.updated_at,
  m.title,
  m.original_title,
  m.year,
  m.release_date,
  m.poster_path,
  m.runtime,
  m.genres,
  m.tmdb_rating,
  max(we.watched_on) as last_watched_on
from user_media um
join media m
  on m.tmdb_id = um.tmdb_id
  and m.media_type = um.media_type
left join watch_entries we
  on we.user_id = um.user_id
  and we.tmdb_id = um.tmdb_id
  and we.media_type = um.media_type
group by
  um.user_id, um.tmdb_id, um.media_type, um.status, um.rating, um.liked,
  um.created_at, um.updated_at,
  m.title, m.original_title, m.year, m.release_date, m.poster_path, m.runtime,
  m.genres, m.tmdb_rating;

comment on view user_library is
  'Flattened user_media + media for the Library page. security_invoker = true means RLS on the underlying tables still applies to every query through this view — see migration header comment. last_watched_on is MAX(watch_entries.watched_on) for the title, nullable.';

grant select on user_library to authenticated;

-- ----------------------------------------------------------------------------
-- diary_entries_view
-- watch_entries inner-joined to media, one row per individual viewing.
-- ----------------------------------------------------------------------------

create view diary_entries_view
with (security_invoker = true) as
select
  we.id,
  we.user_id,
  we.tmdb_id,
  we.media_type,
  we.watched_on,
  we.rating as entry_rating,
  we.review,
  we.is_rewatch,
  we.season_number,
  we.episode_number,
  we.created_at,
  we.updated_at,
  m.title,
  m.year,
  m.poster_path,
  m.runtime,
  m.genres
from watch_entries we
join media m
  on m.tmdb_id = we.tmdb_id
  and m.media_type = we.media_type;

comment on view diary_entries_view is
  'Flattened watch_entries + media for the Diary page. security_invoker = true means RLS on watch_entries still applies to every query through this view — see migration header comment.';

grant select on diary_entries_view to authenticated;
