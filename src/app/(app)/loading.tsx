import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-5 w-72" />
      <div>
        <Skeleton className="mb-3 h-4 w-40" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-32 shrink-0 sm:w-36">
              <Skeleton className="aspect-2/3 w-full rounded-poster" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
