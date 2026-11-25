import Link from "next/link";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/env";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Layers className="h-5 w-5" />
          ThreadForge
        </Link>

        <nav className="hidden gap-6 text-sm text-muted-foreground sm:flex">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/#templates" className="hover:text-foreground">
            Templates
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <Button size="sm" asChild>
              <Link href="/dashboard/mockups">Open demo workspace</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Get started free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} ThreadForge. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/dashboard/mockups" className="hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
