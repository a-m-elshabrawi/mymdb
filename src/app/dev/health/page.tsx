import { notFound } from "next/navigation";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { searchMulti, tmdbImageUrl, type MediaSearchResult } from "@/lib/tmdb";

// Development-only foundation health check. Gated below so it 404s in
// production — it's a dev utility that exposes environment/connectivity
// detail and has no place in a shipped build.

export const dynamic = "force-dynamic";

interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

function checkEnv(): CheckResult {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "TMDB_READ_ACCESS_TOKEN",
  ] as const;

  const missing = required.filter((key) => !process.env[key]);

  return {
    name: "Environment",
    pass: missing.length === 0,
    detail:
      missing.length === 0
        ? "All 4 required variables are present."
        : `Missing: ${missing.join(", ")}`,
  };
}

async function checkSupabase(): Promise<CheckResult> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("media")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw error;
    }

    return {
      name: "Supabase",
      pass: true,
      detail: `select count(*) from media succeeded. Visible row count: ${count ?? 0}.`,
    };
  } catch (error) {
    return {
      name: "Supabase",
      pass: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkTmdb(): Promise<{ result: CheckResult; results: MediaSearchResult[] }> {
  try {
    const { results, totalResults } = await searchMulti("blade runner");
    return {
      result: {
        name: "TMDB",
        pass: results.length > 0,
        detail: `searchMulti("blade runner") returned ${results.length} result(s) (${totalResults} total).`,
      },
      results,
    };
  } catch (error) {
    return {
      result: {
        name: "TMDB",
        pass: false,
        detail: error instanceof Error ? error.message : String(error),
      },
      results: [],
    };
  }
}

function CheckRow({ result }: { result: CheckResult }) {
  return (
    <div className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0">
      <Badge variant={result.pass ? "default" : "destructive"} className="mt-0.5 shrink-0">
        {result.pass ? "PASS" : "FAIL"}
      </Badge>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{result.name}</p>
        <p className="break-words text-sm text-muted-foreground">{result.detail}</p>
      </div>
    </div>
  );
}

export default async function HealthPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const envCheck = checkEnv();
  const [supabaseCheck, { result: tmdbCheck, results: tmdbResults }] = await Promise.all([
    checkSupabase(),
    checkTmdb(),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="mb-2 flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Foundation health check
        </h1>
        <Badge variant="secondary">dev only</Badge>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        Verifies environment, Supabase, and the TMDB adapter in one glance. See TODO in
        src/app/dev/health/page.tsx.
      </p>

      <Card className="mb-8 gap-0 overflow-hidden py-0">
        <CardContent className="p-0">
          <CheckRow result={envCheck} />
          <CheckRow result={supabaseCheck} />
          <CheckRow result={tmdbCheck} />
        </CardContent>
      </Card>

      {tmdbResults.length > 0 ? (
        <>
          <Separator className="mb-6" />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top 3 results for &ldquo;blade runner&rdquo;
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {tmdbResults.slice(0, 3).map((item) => {
                  const poster = tmdbImageUrl(item.poster_path, "w185");
                  return (
                    <div
                      key={`${item.media_type}-${item.tmdb_id}`}
                      className="overflow-hidden rounded-poster border border-border bg-surface"
                    >
                      <div className="relative aspect-2/3 w-full bg-surface-hover">
                        {poster ? (
                          <Image
                            src={poster}
                            alt={item.title}
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {item.year ?? "—"} · {item.media_type}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  );
}
