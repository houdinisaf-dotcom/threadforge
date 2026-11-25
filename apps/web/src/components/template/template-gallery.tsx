"use client";

import { useState } from "react";
import type { Template, TemplateCategory } from "@prisma/client";
import { cn } from "@/lib/utils";

const CATEGORIES: { label: string; value: TemplateCategory | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Tees", value: "TSHIRT" },
  { label: "Hoodies", value: "HOODIE" },
  { label: "Hats", value: "HAT" },
  { label: "Joggers", value: "JOGGERS" },
];

interface TemplateGalleryProps {
  templates: Template[];
  selected?: string;
  onSelect: (template: Template) => void;
  columns?: 2 | 3;
}

export function TemplateGallery({ templates, selected, onSelect, columns = 2 }: TemplateGalleryProps) {
  const [category, setCategory] = useState<TemplateCategory | "ALL">("ALL");

  const available = CATEGORIES.filter(
    (entry) => entry.value === "ALL" || templates.some((t) => t.category === entry.value)
  );
  const filtered =
    category === "ALL" ? templates : templates.filter((t) => t.category === category);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {available.map((entry) => (
          <button
            key={entry.value}
            type="button"
            onClick={() => setCategory(entry.value)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              category === entry.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "grid gap-2",
          columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
        )}
      >
        {filtered.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            aria-pressed={selected === template.id}
            className={cn(
              "group relative overflow-hidden rounded-lg border-2 bg-muted/40 transition-all",
              selected === template.id
                ? "border-primary shadow-sm"
                : "border-transparent hover:border-primary/40"
            )}
          >
            {/* Local SVG artwork — a plain img avoids the optimiser for vectors. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={template.thumbUrl}
              alt={template.name}
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
            {template.isPremium && (
              <span className="absolute right-1 top-1 rounded bg-amber-400 px-1 text-[9px] font-bold uppercase tracking-wide text-amber-950">
                Pro
              </span>
            )}
            <span className="block truncate bg-background/90 px-1 py-1 text-center text-[11px]">
              {template.name.replace(/\s+—.*$/, "")}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No templates in this category yet.
        </p>
      )}
    </div>
  );
}
