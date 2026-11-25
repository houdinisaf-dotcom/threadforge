"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Canvas } from "fabric";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Cloud,
  Download,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { MockupStatus, Template } from "@prisma/client";
import { MockupCanvas } from "@/components/editor/canvas";
import { EditorToolbar } from "@/components/editor/toolbar";
import { TemplateGallery } from "@/components/template/template-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/hooks/useEditor";
import { canvasPreview, downloadUrl, exportFilename, serializeCanvas } from "@/lib/editor";
import { cn } from "@/lib/utils";

export interface EditorMockup {
  id: string;
  name: string;
  status: MockupStatus;
  templateId: string;
  canvasJson: Record<string, unknown> | null;
  previewUrl: string | null;
}

interface EditorShellProps {
  templates: Template[];
  mockup?: EditorMockup | null;
}

const STATUS_LABEL: Record<MockupStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export function EditorShell({ templates, mockup }: EditorShellProps) {
  const router = useRouter();
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [template, setTemplate] = useState<Template>(
    () => templates.find((item) => item.id === mockup?.templateId) ?? templates[0]
  );
  const [carriedJson, setCarriedJson] = useState<Record<string, unknown> | null>(
    mockup?.canvasJson ?? null
  );
  const [isExporting, setIsExporting] = useState(false);

  const mockupId = useEditorStore((state) => state.mockupId);
  const name = useEditorStore((state) => state.name);
  const status = useEditorStore((state) => state.status);
  const isDirty = useEditorStore((state) => state.isDirty);
  const isSaving = useEditorStore((state) => state.isSaving);
  const init = useEditorStore((state) => state.init);
  const setName = useEditorStore((state) => state.setName);
  const setStatus = useEditorStore((state) => state.setStatus);
  const markDirty = useEditorStore((state) => state.markDirty);
  const setSaving = useEditorStore((state) => state.setSaving);
  const markSaved = useEditorStore((state) => state.markSaved);

  useEffect(() => {
    init({
      mockupId: mockup?.id ?? null,
      name: mockup?.name ?? "Untitled mockup",
      status: mockup?.status ?? "DRAFT",
      templateId: mockup?.templateId ?? templates[0]?.id ?? null,
    });
  }, [init, mockup?.id, mockup?.name, mockup?.status, mockup?.templateId, templates]);

  const save = useCallback(async (): Promise<string | null> => {
    if (!canvas) {
      toast.error("The canvas is still loading");
      return null;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim() || "Untitled mockup",
        templateId: template.id,
        status,
        canvasJson: serializeCanvas(canvas),
        previewDataUrl: canvasPreview(canvas),
      };

      const response = await fetch(mockupId ? `/api/mockups/${mockupId}` : "/api/mockups", {
        method: mockupId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save mockup");

      const id: string = result.data.id;
      markSaved(id);
      toast.success("Mockup saved");

      if (!mockupId) router.replace(`/dashboard/editor/${id}`);
      else router.refresh();

      return id;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save mockup");
      setSaving(false);
      return null;
    }
  }, [canvas, markSaved, mockupId, name, router, setSaving, status, template.id]);

  const exportMockup = useCallback(
    async (format: "PNG" | "WEBP") => {
      if (!canvas) return;

      setIsExporting(true);
      try {
        const id = await save();
        const dataUrl = canvas.toDataURL({
          format: format === "PNG" ? "png" : "webp",
          quality: 0.92,
          multiplier: 2.5,
        });

        if (id) {
          const response = await fetch("/api/export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mockupId: id, format, width: 2000, dataUrl }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? "Export failed");
          if (result.data?.url && !result.data.url.startsWith("data:")) {
            window.open(result.data.url, "_blank", "noopener");
          }
        }

        downloadUrl(dataUrl, exportFilename(name, format));
        toast.success(`${format} export ready`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Export failed");
      } finally {
        setIsExporting(false);
      }
    },
    [canvas, name, save]
  );

  const switchTemplate = useCallback(
    (next: Template) => {
      if (next.id === template.id) return;
      if (canvas) setCarriedJson(serializeCanvas(canvas) as unknown as Record<string, unknown>);
      setTemplate(next);
      markDirty();
    },
    [canvas, markDirty, template.id]
  );

  const initialJson = useMemo(() => carriedJson, [carriedJson]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/dashboard/mockups" aria-label="Back to mockups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label="Mockup name"
          className="h-9 max-w-xs border-transparent bg-transparent px-2 text-lg font-semibold shadow-none focus-visible:border-input"
        />

        <Badge variant={status === "PUBLISHED" ? "success" : "secondary"}>
          {STATUS_LABEL[status]}
        </Badge>

        <span className={cn("text-xs", isDirty ? "text-amber-600" : "text-muted-foreground")}>
          {isSaving ? "Saving…" : isDirty ? "Unsaved changes" : "All changes saved"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Status <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Visibility</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(STATUS_LABEL) as MockupStatus[]).map((value) => (
                <DropdownMenuItem key={value} onSelect={() => setStatus(value)}>
                  {STATUS_LABEL[value]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={save} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => exportMockup("PNG")}>
                PNG — print ready
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => exportMockup("WEBP")}>
                WebP — web ready
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid flex-1 items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" /> Garment
            </h2>
            <TemplateGallery
              templates={templates}
              selected={template.id}
              onSelect={switchTemplate}
            />
          </section>

          <section className="rounded-xl border bg-card p-4 text-sm shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 font-semibold">
              <Cloud className="h-4 w-4" /> Canvas
            </h2>
            <dl className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <dt>Size</dt>
                <dd>800 × 800 px</dd>
              </div>
              <div className="flex justify-between">
                <dt>Print area</dt>
                <dd>from template</dd>
              </div>
              <div className="flex justify-between">
                <dt>Objects</dt>
                <dd>{canvas ? Math.max(canvas.getObjects().length - 2, 0) : 0}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Artwork is kept when you switch garments. The dashed rectangle marks the printable
              area for this template.
            </p>
          </section>
        </aside>

        <div className="space-y-3">
          <EditorToolbar canvas={canvas} template={template} onDirty={markDirty} />
          <MockupCanvas
            key={template.id}
            template={template}
            initialJson={initialJson}
            onReady={(instance) => setCanvas(instance)}
            onDirty={markDirty}
          />
        </div>
      </div>
    </div>
  );
}
