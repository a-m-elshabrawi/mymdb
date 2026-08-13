import { MediaGrid } from "@/components/media-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-full max-w-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-16" />
        </div>
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
