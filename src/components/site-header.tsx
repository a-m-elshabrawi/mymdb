"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/library", label: "Library" },
  { href: "/diary", label: "Diary" },
  { href: "/watchlist", label: "Watchlist" },
];

const searchInputClassName =
  "h-8 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function SiteHeader({ email }: { email: string }) {
  const pathname = usePathname();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/"
            className={cn(
              "shrink-0 text-sm font-semibold tracking-tight text-foreground",
              mobileSearchOpen && "hidden sm:block",
            )}
          >
            MyMDB
          </Link>

          <nav className="hidden items-center gap-6 sm:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Desktop: search is always visible. No JS needed — it's a plain
              GET form, Enter navigates to /search. */}
          <form
            method="GET"
            action="/search"
            className="relative hidden w-full max-w-56 sm:block"
          >
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Search titles…"
              aria-label="Search"
              className={searchInputClassName}
            />
          </form>

          {/* Mobile: collapses to an icon that expands into the same plain
              form — no separate drawer, matches the nav-collapse pattern. */}
          <div className="sm:hidden">
            {mobileSearchOpen ? (
              <form method="GET" action="/search" className="relative flex items-center gap-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search titles…"
                  aria-label="Search"
                  autoFocus
                  className={cn(searchInputClassName, "w-36")}
                />
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  aria-label="Close search"
                  className="flex size-8 shrink-0 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                aria-label="Search"
                className="flex size-8 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Search className="size-4" />
              </button>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-8 items-center justify-center rounded-full bg-surface-hover text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Account menu"
          >
            {initial}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Below sm, the header nav is hidden — the same links live here instead. */}
            <div className="sm:hidden">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>

            <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-default text-left">
                  Sign out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
