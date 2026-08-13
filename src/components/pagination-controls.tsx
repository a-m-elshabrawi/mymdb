import Link from "next/link";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
}

export function PaginationControls({ page, pageSize, total, buildHref }: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) {
    return null;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-6 py-10">
      {prevDisabled ? (
        <span className="text-sm text-muted-foreground/50">Previous</span>
      ) : (
        <Link href={buildHref(page - 1)} className="text-sm text-foreground hover:text-accent-hover">
          Previous
        </Link>
      )}
      <span className="text-sm tabular-nums text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {nextDisabled ? (
        <span className="text-sm text-muted-foreground/50">Next</span>
      ) : (
        <Link href={buildHref(page + 1)} className="text-sm text-foreground hover:text-accent-hover">
          Next
        </Link>
      )}
    </nav>
  );
}
