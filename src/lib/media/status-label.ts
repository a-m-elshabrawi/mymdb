import type { Database } from "@/lib/supabase/types";

type WatchStatus = Database["public"]["Enums"]["watch_status"];

// No "server-only" import here on purpose: this is a plain display-label
// map with no DB access, used from client components (library-filter-bar)
// as well as server components (library-list-table). Importing it from
// lib/media/library.ts instead would drag that file's `server-only` guard
// into any client bundle that needs a status label.
export const STATUS_LABEL: Record<WatchStatus, string> = {
  watchlist: "Watchlist",
  watching: "Watching",
  watched: "Watched",
  dropped: "Dropped",
};
