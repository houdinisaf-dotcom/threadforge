import Link from "next/link";
import type { Metadata } from "next";
import { Layers, Image as ImageIcon, Palette, Settings, Folder, Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { isDemoMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const nav = [
  { href: "/dashboard/mockups", label: "Mockups", icon: ImageIcon },
  { href: "/dashboard/collections", label: "Collections", icon: Folder },
  { href: "/dashboard/brands", label: "Brands", icon: Palette },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r bg-card sm:flex">
        <Link
          href="/"
          className="flex h-14 items-center gap-2 border-b px-4 font-semibold tracking-tight"
        >
          <Layers className="h-5 w-5" />
          ThreadForge
        </Link>

        <div className="p-3">
          <Link
            href="/dashboard/editor/new"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New mockup
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t p-3">
          {isDemoMode && (
            <Badge variant="warning" className="w-full justify-center py-1 text-[10px]">
              Demo workspace
            </Badge>
          )}
          <div className="flex items-center gap-2.5">
            {isDemoMode ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {(user?.name ?? "Demo").slice(0, 1)}
              </div>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{user?.name ?? user?.email ?? "Guest"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.plan} plan</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Compact navigation for small screens */}
        <div className="flex items-center gap-2 overflow-x-auto border-b bg-card px-3 py-2 sm:hidden">
          <Link href="/dashboard/mockups" className="mr-1 flex items-center gap-1.5 font-semibold">
            <Layers className="h-4 w-4" />
          </Link>
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
          <Link
            href="/dashboard/editor/new"
            className="ml-auto flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </Link>
        </div>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
