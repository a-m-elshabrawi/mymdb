import { Skeleton } from "@/components/ui/skeleton";

export function TitleDetailSkeleton() {
  return (
    <div>
      <Skeleton className="-mx-6 -mt-10 aspect-21/9 min-h-[220px] w-[calc(100%+3rem)] rounded-none sm:min-h-[320px]" />

      <div className="relative z-10 -mt-16 flex gap-4 sm:-mt-24 sm:gap-6">
        <Skeleton className="aspect-2/3 w-28 shrink-0 rounded-poster sm:w-44" />
        <div className="min-w-0 flex-1 space-y-3 pt-14 sm:pt-24">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="mt-3 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <Skeleton className="mt-6 h-4 w-full max-w-[65ch]" />
      <Skeleton className="mt-2 h-4 w-full max-w-[65ch]" />
      <Skeleton className="mt-2 h-4 w-2/3 max-w-[65ch]" />

      <Skeleton className="mt-8 h-20 w-full rounded-lg" />

      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}
