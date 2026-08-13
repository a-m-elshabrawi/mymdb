import { X } from "lucide-react";
import Link from "next/link";

export function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-foreground transition-colors hover:border-accent/50"
    >
      {label}
      <X className="size-3 text-muted-foreground" />
    </Link>
  );
}
