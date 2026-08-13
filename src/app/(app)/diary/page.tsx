import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DiaryEntryRow } from "@/components/diary-entry-row";
import { DiaryFilterBar } from "@/components/diary-filter-bar";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatMonthLabel } from "@/lib/format";
import {
  DIARY_PAGE_SIZE,
  getDiary,
  getDiaryFacets,
  hasActiveDiaryFilters,
  parseDiaryFilters,
  type DiaryEntryRow as DiaryEntryRowData,
} from "@/lib/media/library";

export const metadata: Metadata = { title: "Diary" };

interface DiaryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface MonthGroup {
  key: string;
  label: string;
  entries: DiaryEntryRowData[];
}

/**
 * Grouping is computed fresh from whatever page of entries was returned —
 * there's no attempt to remember which months were already shown on a
 * previous page. A month that spans a page boundary therefore renders its
 * heading again at the top of the next page rather than silently
 * continuing under nothing, which is the point: each page has to stand on
 * its own.
 */
function groupByMonth(entries: DiaryEntryRowData[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const entry of entries) {
    const key = entry.watched_on.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.entries.push(entry);
    } else {
      groups.push({ key, label: formatMonthLabel(key), entries: [entry] });
    }
  }
  return groups;
}

function buildPageHref(
  rawParams: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) {
    if (value === undefined) continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) {
      params.set(key, first);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `/diary?${qs}` : "/diary";
}

export default async function DiaryPage({ searchParams }: DiaryPageProps) {
  const user = await requireUser();
  const rawParams = await searchParams;
  const filters = parseDiaryFilters(rawParams);
  const active = hasActiveDiaryFilters(filters);

  const [{ entries, total }, { years }] = await Promise.all([
    getDiary(user.id, filters),
    getDiaryFacets(user.id),
  ]);

  if (total === 0 && !active) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-base font-medium text-foreground">Your diary is empty</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Search for a film or show and log a viewing to start your diary.
        </p>
        <Button asChild>
          <Link href="/search">
            <Search className="size-4" />
            Search
          </Link>
        </Button>
      </div>
    );
  }

  const groups = groupByMonth(entries);

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Diary</h1>
        <p className="text-sm text-muted-foreground">
          <span className="tabular-nums text-foreground">{total}</span> viewing
          {total === 1 ? "" : "s"}
        </p>
      </div>

      <DiaryFilterBar filters={filters} years={years} />

      <div className="mt-6">
        {total === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-base font-medium text-foreground">No entries match these filters</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/diary">Clear all</Link>
            </Button>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.key}>
              <div className="sticky top-14 z-10 -mx-6 flex items-baseline gap-2 bg-background/90 px-6 py-2 backdrop-blur">
                <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
                <span className="text-xs text-muted-foreground">
                  {group.entries.length} title{group.entries.length === 1 ? "" : "s"}
                </span>
              </div>
              <div>
                {group.entries.map((entry) => (
                  <DiaryEntryRow key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <PaginationControls
        page={filters.page}
        pageSize={DIARY_PAGE_SIZE}
        total={total}
        buildHref={(page) => buildPageHref(rawParams, page)}
      />
    </div>
  );
}
