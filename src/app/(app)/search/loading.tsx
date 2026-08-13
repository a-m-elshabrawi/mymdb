import { MediaGrid } from "@/components/media-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-full max-w-md" />

      <div className="mt-6 flex gap-4 border-b border-border pb-2">
        <Skeleton className="h-5 w-8" />
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-8" />
      </div>

      <Skeleton className="mt-4 h-4 w-56" />

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
