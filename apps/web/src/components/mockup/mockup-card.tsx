import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { MockupWithTemplate } from "@/types";

interface MockupCardProps {
  mockup: MockupWithTemplate;
  onDelete?: (id: string) => void;
}

export function MockupCard({ mockup, onDelete }: MockupCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/dashboard/editor/${mockup.id}`} className="block aspect-square overflow-hidden">
        {mockup.previewUrl ? (
          <Image
            src={mockup.previewUrl}
            alt={mockup.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
            No preview
          </div>
        )}
      </Link>

      <div className="flex items-start justify-between p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{mockup.name}</p>
          <p className="truncate text-xs text-muted-foreground">{mockup.template.name}</p>
        </div>

        <div className="flex items-center gap-1">
          <Badge
            variant={mockup.status === "PUBLISHED" ? "default" : "secondary"}
            className="shrink-0 text-[10px]"
          >
            {mockup.status.toLowerCase()}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/editor/${mockup.id}`}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-3.5 w-3.5" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(mockup.id)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
