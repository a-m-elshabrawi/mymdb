import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteDescription = "A private, personal watch log for films and TV shows.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MyMDB",
    template: "%s · MyMDB",
  },
  description: siteDescription,
  applicationName: "MyMDB",
  openGraph: {
    type: "website",
    siteName: "MyMDB",
    title: "MyMDB",
    description: siteDescription,
    url: siteUrl,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
