"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, MoreHorizontal, Pencil, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { MockupWithTemplate } from "@/types";

interface MockupCardProps {
  mockup: MockupWithTemplate;
  onDelete?: (id: string) => void;
}

export function MockupCard({ mockup, onDelete }: MockupCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const remove = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/mockups/${mockup.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete mockup");
      toast.success(`Deleted “${mockup.name}”`);
      onDelete?.(mockup.id);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete mockup");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/dashboard/editor/${mockup.id}`} className="block aspect-square overflow-hidden">
        {mockup.previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={mockup.previewUrl}
            alt={mockup.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
            No preview yet
          </div>
        )}
      </Link>

      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{mockup.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {mockup.template.name.replace(/\s+—.*$/, "")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Badge
            variant={mockup.status === "PUBLISHED" ? "success" : "secondary"}
            className="text-[10px] capitalize"
          >
            {mockup.status.toLowerCase()}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                {isDeleting || isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-3.5 w-3.5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/editor/${mockup.id}`}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  navigator.clipboard
                    .writeText(`${window.location.origin}/dashboard/editor/${mockup.id}`)
                    .then(() => toast.success("Link copied"))
                    .catch(() => toast.error("Could not copy link"));
                }}
              >
                <Copy className="mr-2 h-3.5 w-3.5" /> Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={remove}>
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
