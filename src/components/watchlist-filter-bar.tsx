"use client";

import { Shuffle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { FilterChip } from "@/components/filter-chip";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { surpriseMe } from "@/lib/actions/watchlist";
import type { WatchlistFacets, WatchlistFilters, WatchlistSort } from "@/lib/media/watchlist";

const SORT_OPTIONS: { value: WatchlistSort; label: string }[] = [
  { value: "added_desc", label: "Recently added" },
  { value: "added_asc", label: "Oldest added" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "year_desc", label: "Newest" },
  { value: "runtime_asc", label: "Shortest runtime" },
  { value: "tmdb_rating_desc", label: "Highest TMDB rating" },
];

const RUNTIME_OPTIONS = [
  { value: "all", label: "Any length" },
  { value: "90", label: "Under 90m" },
  { value: "120", label: "Under 2h" },
  { value: "150", label: "Under 2h 30m" },
];

interface WatchlistFilterBarProps {
  filters: WatchlistFilters;
  facets: WatchlistFacets;
  total: number;
}

export function WatchlistFilterBar({ filters, facets, total }: WatchlistFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function buildHref(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function navigate(overrides: Record<string, string | null>) {
    startTransition(() => {
      router.push(buildHref(overrides));
    });
  }

  const chips: { label: string; href: string }[] = [];
  if (filters.type !== "all") {
    chips.push({ label: filters.type === "movie" ? "Films" : "TV", href: buildHref({ type: null }) });
  }
  if (filters.genre) {
    chips.push({ label: filters.genre, href: buildHref({ genre: null }) });
  }
  if (filters.decade !== null) {
    chips.push({ label: `${filters.decade}s`, href: buildHref({ decade: null }) });
  }
  if (filters.maxRuntime !== "all") {
    const label = RUNTIME_OPTIONS.find((option) => option.value === String(filters.maxRuntime))?.label ?? "";
    chips.push({ label, href: buildHref({ maxRuntime: null }) });
  }

  const hasActive = chips.length > 0;
  const clearAllHref = buildHref({ type: null, genre: null, decade: null, maxRuntime: null });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filters.type} onValueChange={(v) => navigate({ type: v === "all" ? null : v })}>
            <SelectTrigger size="sm" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="movie">Films</SelectItem>
              <SelectItem value="tv">TV</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.genre ?? "all"}
            onValueChange={(v) => navigate({ genre: v === "all" ? null : v })}
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="Any genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any genre</SelectItem>
              {facets.genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.decade !== null ? String(filters.decade) : "all"}
            onValueChange={(v) => navigate({ decade: v === "all" ? null : v })}
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="Any decade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any decade</SelectItem>
              {facets.decades.map((decade) => (
                <SelectItem key={decade} value={String(decade)}>
                  {decade}s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* The filter that matters most on this page. */}
          <Select
            value={String(filters.maxRuntime)}
            onValueChange={(v) => navigate({ maxRuntime: v === "all" ? null : v })}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RUNTIME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.sort} onValueChange={(v) => navigate({ sort: v })}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form action={surpriseMe}>
          <input type="hidden" name="type" value={filters.type} />
          {filters.genre ? <input type="hidden" name="genre" value={filters.genre} /> : null}
          {filters.decade !== null ? (
            <input type="hidden" name="decade" value={String(filters.decade)} />
          ) : null}
          <input type="hidden" name="maxRuntime" value={String(filters.maxRuntime)} />
          <Button type="submit" disabled={total === 0}>
            <Shuffle className="size-4" />
            Surprise me
          </Button>
        </form>
      </div>

      {hasActive ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <FilterChip key={chip.label} label={chip.label} href={chip.href} />
          ))}
          <Link
            href={clearAllHref}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Clear all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
