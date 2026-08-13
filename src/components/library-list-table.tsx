import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

import { PosterImage } from "@/components/poster-image";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/lib/format";
import type { LibraryRow } from "@/lib/media/library";
import { STATUS_LABEL } from "@/lib/media/status-label";
import { cn } from "@/lib/utils";

function compactRuntime(runtime: number | null): string {
  if (runtime === null) {
    return "—";
  }
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

function buildSortHref(
  rawParams: Record<string, string | string[] | undefined>,
  nextSort: string,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) {
    if (value === undefined) continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) {
      params.set(key, first);
    }
  }
  params.set("sort", nextSort);
  params.delete("page");
  return `/library?${params.toString()}`;
}

interface SortableHeaderProps {
  label: string;
  sortValues: readonly string[];
  currentSort: string;
  rawParams: Record<string, string | string[] | undefined>;
  align?: "left" | "right";
}

function SortableHeader({ label, sortValues, currentSort, rawParams, align = "left" }: SortableHeaderProps) {
  const activeIndex = sortValues.indexOf(currentSort);
  const isActive = activeIndex !== -1;
  const nextSort = isActive ? sortValues[(activeIndex + 1) % sortValues.length] : sortValues[0];
  const isDesc = isActive && currentSort.endsWith("_desc");

  return (
    <th
      scope="col"
      className={cn("px-3 py-2 text-xs font-medium text-muted-foreground", align === "right" && "text-right")}
    >
      <Link
        href={buildSortHref(rawParams, nextSort)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          isActive && "text-foreground",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        {isActive && sortValues.length > 1 ? (
          isDesc ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />
        ) : null}
      </Link>
    </th>
  );
}

interface LibraryListTableProps {
  rows: LibraryRow[];
  currentSort: string;
  rawParams: Record<string, string | string[] | undefined>;
}

export function LibraryListTable({ rows, currentSort, rawParams }: LibraryListTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="w-12 px-3 py-2" aria-hidden />
            <SortableHeader label="Title" sortValues={["title_asc"]} currentSort={currentSort} rawParams={rawParams} />
            <SortableHeader
              label="Year"
              sortValues={["year_desc", "year_asc"]}
              currentSort={currentSort}
              rawParams={rawParams}
              align="right"
            />
            <SortableHeader
              label="Runtime"
              sortValues={["runtime_desc", "runtime_asc"]}
              currentSort={currentSort}
              rawParams={rawParams}
              align="right"
            />
            <SortableHeader
              label="Rating"
              sortValues={["rating_desc", "rating_asc"]}
              currentSort={currentSort}
              rawParams={rawParams}
              align="right"
            />
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              Status
            </th>
            <SortableHeader
              label="Added"
              sortValues={["added_desc"]}
              currentSort={currentSort}
              rawParams={rawParams}
              align="right"
            />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.media_type}-${row.tmdb_id}`}
              className="border-b border-border last:border-0 hover:bg-surface-hover"
            >
              <td className="px-3 py-2">
                <Link href={`/${row.media_type}/${row.tmdb_id}`} className="block w-10">
                  <PosterImage posterPath={row.poster_path} title={row.title} sizes="40px" />
                </Link>
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/${row.media_type}/${row.tmdb_id}`}
                  className="text-foreground hover:underline"
                >
                  {row.title}
                </Link>
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{row.year ?? "—"}</td>
              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                {compactRuntime(row.runtime)}
              </td>
              <td className="px-3 py-2">
                <div className="flex justify-end">
                  <StarRating value={row.user_rating} readOnly size="sm" />
                </div>
              </td>
              <td className="px-3 py-2">
                <Badge variant="secondary">{STATUS_LABEL[row.status]}</Badge>
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                {formatTimestamp(row.added_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
