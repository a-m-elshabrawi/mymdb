import type { Metadata } from "next";

import { MarketingHeader } from "@/components/marketing/marketing-header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const marketingTitle = "MyMDB — Every film you've ever watched, in one place";
const marketingDescription =
  "A private watch log for the films and shows you actually finish. Search, rate in half-stars, review, and build your own library, diary, and watchlist.";

// This is the only shareable, indexable page. It overrides the root layout's
// blanket robots:noindex (the rest of the app stays private) and sets its own
// Open Graph tags.
export const metadata: Metadata = {
  title: { absolute: marketingTitle },
  description: marketingDescription,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "MyMDB",
    title: marketingTitle,
    description: marketingDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: marketingTitle,
    description: marketingDescription,
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
