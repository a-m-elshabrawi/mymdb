import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
        <Image src="/tmdb-logo.svg" alt="TMDB" width={92} height={12} className="shrink-0" />
        <p className="text-xs text-muted-foreground">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}
