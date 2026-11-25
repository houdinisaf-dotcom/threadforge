import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getMockups } from "@/lib/data";
import { MockupCard } from "@/components/mockup/mockup-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Mockups" };

export default async function MockupsPage() {
  const mockups = await getMockups();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mockups</h1>
          <p className="text-sm text-muted-foreground">
            {mockups.length} mockup{mockups.length === 1 ? "" : "s"} in your workspace
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/editor/new">
            <Plus className="mr-2 h-4 w-4" />
            New mockup
          </Link>
        </Button>
      </div>

      {mockups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-24 text-center">
          <p className="text-lg font-medium">No mockups yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Pick a garment, drop in your artwork and export a print-ready image in seconds.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/editor/new">
              <Plus className="mr-2 h-4 w-4" />
              Create your first mockup
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {mockups.map((mockup) => (
            <MockupCard key={mockup.id} mockup={mockup} />
          ))}
        </div>
      )}
    </div>
  );
}
