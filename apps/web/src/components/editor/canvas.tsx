"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, FabricImage, Rect } from "fabric";
import type { FabricObject } from "fabric";
import type { Template } from "@/types";
import { parseDesignArea } from "@/lib/editor";
import { cn } from "@/lib/utils";

const CANVAS_SIZE = 800;

interface MockupCanvasProps {
  template: Template;
  /** Previously saved fabric scene graph, if the mockup already exists. */
  initialJson?: Record<string, unknown> | null;
  onReady?: (canvas: Canvas) => void;
  onDirty?: () => void;
  className?: string;
}

export function MockupCanvas({
  template,
  initialJson,
  onReady,
  onDirty,
  className,
}: MockupCanvasProps) {
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<Canvas | null>(null);

  // Re-running the effect on every render would destroy the artwork, so the
  // saved JSON is keyed by value rather than by reference.
  const jsonKey = useMemo(
    () => (initialJson && Object.keys(initialJson).length ? JSON.stringify(initialJson) : ""),
    [initialJson]
  );

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const element = canvasEl.current;
    if (!element) return;

    let disposed = false;
    const canvas = new Canvas(element, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });
    canvasRef.current = canvas;

    // Only real user edits should mark the mockup dirty — restoring the saved
    // scene and adding the garment/guide fire object:added too.
    let ready = false;
    const handleChange = (event: { target?: FabricObject }) => {
      const target = event.target as (FabricObject & { isTemplate?: boolean }) | undefined;
      if (!ready || !target || target.isTemplate || target.excludeFromExport) return;
      onDirty?.();
    };

    const load = async () => {
      if (jsonKey) {
        try {
          await canvas.loadFromJSON(JSON.parse(jsonKey));
        } catch (error) {
          console.error("Could not restore saved canvas", error);
        }
      }

      const image = await FabricImage.fromURL(template.imageUrl, { crossOrigin: "anonymous" });
      if (disposed) return;

      Object.assign(image, { isTemplate: true });
      image.set({ selectable: false, evented: false, hoverCursor: "default" });
      image.scaleToWidth(CANVAS_SIZE);
      canvas.add(image);
      canvas.sendObjectToBack(image);

      // Faint dashed guide showing where artwork should sit on the garment.
      const area = parseDesignArea(template);
      const guide = new Rect({
        left: area.x,
        top: area.y,
        width: area.width,
        height: area.height,
        fill: "transparent",
        stroke: "#94a3b8",
        strokeWidth: 1.5,
        strokeDashArray: [8, 8],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        hoverCursor: "default",
      });
      canvas.add(guide);
      canvas.sendObjectToBack(guide);
      canvas.sendObjectToBack(image);
      canvas.renderAll();

      ready = true;
      onReadyRef.current?.(canvas);
    };

    load().catch((error) => console.error("Could not load template", error));

    canvas.on("object:modified", handleChange);
    canvas.on("object:added", handleChange);
    canvas.on("object:removed", handleChange);

    return () => {
      disposed = true;
      canvas.off("object:modified", handleChange);
      canvas.off("object:added", handleChange);
      canvas.off("object:removed", handleChange);
      canvas.dispose();
      canvasRef.current = null;
    };
    // `onDirty` is intentionally read through a ref-free closure: it is a
    // stable callback from the editor shell.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id, template.imageUrl, template.designArea, jsonKey]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-muted/30 shadow-sm",
        className
      )}
    >
      <canvas ref={canvasEl} className="block h-auto w-full" />
    </div>
  );
}
