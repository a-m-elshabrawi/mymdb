-- ============================================================================
-- MyMDB — fix: pin search_path on set_updated_at()
-- ============================================================================
-- supabase db advisors flagged set_updated_at() with a mutable search_path
-- (function_search_path_mutable). handle_new_user() already pins its
-- search_path; this brings the trigger function in line with the same
-- practice to close off search_path hijacking.
-- ============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
