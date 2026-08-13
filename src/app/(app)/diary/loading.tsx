import { Skeleton } from "@/components/ui/skeleton";

export default function DiaryLoading() {
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-5 w-24" />
      </div>

      <div className="mt-6">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4 border-b border-border py-4">
            <Skeleton className="h-8 w-8 shrink-0" />
            <Skeleton className="aspect-2/3 w-12 shrink-0 rounded-poster" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
