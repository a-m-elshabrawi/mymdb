import { MediaGrid } from "@/components/media-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistLoading() {
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-36" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <MediaGrid className="mt-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="aspect-2/3 w-full rounded-poster" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-1 h-3 w-10" />
          </div>
        ))}
      </MediaGrid>
    </div>
  );
}
