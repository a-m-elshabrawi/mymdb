import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";

export function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-28 text-center">
      <Reveal>
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          Start the log you&apos;ll wish you&apos;d kept years ago.
        </h2>
        <Button asChild size="lg" className="mt-8">
          <Link href="/signup">Create your account</Link>
        </Button>
      </Reveal>
    </section>
  );
}
