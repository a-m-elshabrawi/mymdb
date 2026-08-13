"use client";

import { Filter, LayoutGrid, List as ListIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { FilterChip } from "@/components/filter-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { LibraryFacets, LibraryFilters, LibrarySort } from "@/lib/media/library";
import { STATUS_LABEL } from "@/lib/media/status-label";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: LibrarySort; label: string }[] = [
  { value: "added_desc", label: "Recently added" },
  { value: "watched_desc", label: "Recently watched" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "rating_desc", label: "Highest rated" },
  { value: "rating_asc", label: "Lowest rated" },
  { value: "year_desc", label: "Newest" },
  { value: "year_asc", label: "Oldest" },
  { value: "runtime_desc", label: "Longest runtime" },
  { value: "runtime_asc", label: "Shortest runtime" },
];

const RATING_OPTIONS = [
  { value: "all", label: "Any rating" },
  { value: "rated", label: "Rated" },
  { value: "unrated", label: "Unrated" },
  ...[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => ({
    value: String(n),
    label: `${(n / 2).toFixed(1)}+ stars`,
  })),
];

interface LibraryFilterBarProps {
  filters: LibraryFilters;
  facets: LibraryFacets;
}

export function LibraryFilterBar({ filters, facets }: LibraryFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(filters.q);
  const [, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  function buildHref(overrides: Record<string, string | null>, resetPage = true) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    if (resetPage) {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function navigate(overrides: Record<string, string | null>) {
    startTransition(() => {
      router.push(buildHref(overrides));
    });
  }

  // Debounced free-text filter -> URL, same pattern as SearchInput (Stage 3).
  useEffect(() => {
    const handle = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (q === current) {
        return;
      }
      startTransition(() => {
        router.push(buildHref({ q: q || null }));
      });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const chips: { label: string; href: string }[] = [];
  if (filters.type !== "all") {
    chips.push({ label: filters.type === "movie" ? "Films" : "TV", href: buildHref({ type: null }) });
  }
  if (filters.status !== "all") {
    chips.push({ label: STATUS_LABEL[filters.status], href: buildHref({ status: null }) });
  }
  if (filters.rating !== "all") {
    const label =
      filters.rating === "rated"
        ? "Rated"
        : filters.rating === "unrated"
          ? "Unrated"
          : `${(filters.rating / 2).toFixed(1)}+ stars`;
    chips.push({ label, href: buildHref({ rating: null }) });
  }
  if (filters.genre) {
    chips.push({ label: filters.genre, href: buildHref({ genre: null }) });
  }
  if (filters.decade !== null) {
    chips.push({ label: `${filters.decade}s`, href: buildHref({ decade: null }) });
  }
  if (filters.liked) {
    chips.push({ label: "Liked", href: buildHref({ liked: null }) });
  }
  if (filters.q) {
    chips.push({ label: `"${filters.q}"`, href: buildHref({ q: null }) });
  }

  const hasActive = chips.length > 0;
  const clearAllHref = buildHref({
    type: null,
    status: null,
    rating: null,
    genre: null,
    decade: null,
    liked: null,
    q: null,
  });

  const filterControls = (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Filter by title…"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        aria-label="Filter by title"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Select value={filters.type} onValueChange={(v) => navigate({ type: v === "all" ? null : v })}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="movie">Films</SelectItem>
            <SelectItem value="tv">TV</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => navigate({ status: v === "all" ? null : v })}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="watched">Watched</SelectItem>
            <SelectItem value="watching">Watching</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={String(filters.rating)}
          onValueChange={(v) => navigate({ rating: v === "all" ? null : v })}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
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

        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={filters.liked}
            onCheckedChange={(checked) => navigate({ liked: checked === true ? "1" : null })}
          />
          Liked only
        </label>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="hidden flex-1 md:block">{filterControls}</div>

        <div className="md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Filter className="size-4" />
                Filters
                {hasActive ? (
                  <Badge variant="secondary" className="ml-1">
                    {chips.length}
                  </Badge>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">{filterControls}</div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
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

          <div className="flex items-center rounded-md border border-border">
            <Link
              href={buildHref({ view: null }, false)}
              aria-label="Grid view"
              aria-current={filters.view === "grid" ? "true" : undefined}
              className={cn(
                "flex size-8 items-center justify-center",
                filters.view === "grid" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <LayoutGrid className="size-4" />
            </Link>
            <Link
              href={buildHref({ view: "list" }, false)}
              aria-label="List view"
              aria-current={filters.view === "list" ? "true" : undefined}
              className={cn(
                "flex size-8 items-center justify-center",
                filters.view === "list" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <ListIcon className="size-4" />
            </Link>
          </div>
        </div>
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
