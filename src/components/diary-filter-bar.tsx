"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { FilterChip } from "@/components/filter-chip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DiaryFilters } from "@/lib/media/library";

interface DiaryFilterBarProps {
  filters: DiaryFilters;
  years: number[];
}

export function DiaryFilterBar({ filters, years }: DiaryFilterBarProps) {
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
  if (filters.year !== null) {
    chips.push({ label: String(filters.year), href: buildHref({ year: null }) });
  }
  if (filters.type !== "all") {
    chips.push({ label: filters.type === "movie" ? "Films" : "TV", href: buildHref({ type: null }) });
  }
  if (filters.rated) {
    chips.push({ label: "Rated", href: buildHref({ rated: null }) });
  }

  const hasActive = chips.length > 0;
  const clearAllHref = buildHref({ year: null, type: null, rated: null });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.year !== null ? String(filters.year) : "all"}
          onValueChange={(v) => navigate({ year: v === "all" ? null : v })}
        >
          <SelectTrigger size="sm" className="w-32">
            <SelectValue placeholder="Any year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any year</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={filters.rated}
            onCheckedChange={(checked) => navigate({ rated: checked === true ? "1" : null })}
          />
          Rated only
        </label>
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
