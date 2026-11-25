import type { Metadata } from "next";
import Link from "next/link";
import { Folder, Globe, Lock } from "lucide-react";
import { getCollections } from "@/lib/data";
import { CreateCollection } from "@/components/collection/create-collection";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
          <p className="text-sm text-muted-foreground">
            Lookbooks and drops grouping your mockups.
          </p>
        </div>
        <CreateCollection />
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-24 text-center">
          <Folder className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-lg font-medium">No collections yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Group a few mockups into a seasonal drop or buyer lookbook.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative grid grid-cols-2 gap-px border-b bg-muted">
                {collection.mockups.slice(0, 4).map((mockup) => (
                  <Link
                    key={mockup.id}
                    href={`/dashboard/editor/${mockup.id}`}
                    className="block aspect-[4/3] overflow-hidden bg-muted/60"
                  >
                    {mockup.previewUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={mockup.previewUrl}
                        alt={mockup.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </Link>
                ))}
                {collection.mockups.length === 0 && (
                  <div className="col-span-2 flex aspect-[4/3] items-center justify-center text-xs text-muted-foreground">
                    Empty collection
                  </div>
                )}
              </div>

              <div className="space-y-1.5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate font-semibold">{collection.name}</h2>
                  <Badge variant="outline" className="shrink-0 gap-1 text-[10px]">
                    {collection.isPublic ? (
                      <>
                        <Globe className="h-3 w-3" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Private
                      </>
                    )}
                  </Badge>
                </div>
                {collection.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {collection.mockups.length} mockup{collection.mockups.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
