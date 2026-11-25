import type { Canvas, FabricObject } from "fabric";

/** Fabric objects carry a couple of editor-specific flags we set ourselves. */
type FabricObjectWithFlags = FabricObject & { excludeFromExport?: boolean; isTemplate?: boolean };
import type { DesignArea, Template } from "@/types";

const DEFAULT_AREA: DesignArea = { x: 280, y: 260, width: 240, height: 280, rotation: 0 };

/**
 * `Template.designArea` is a Prisma JSON column, so it arrives untyped. This
 * narrows it to a usable printable area with sensible fallbacks.
 */
export function parseDesignArea(template: Pick<Template, "designArea">): DesignArea {
  const raw = template.designArea as Partial<DesignArea> | null;
  if (!raw || typeof raw !== "object") return DEFAULT_AREA;

  return {
    x: Number(raw.x ?? DEFAULT_AREA.x),
    y: Number(raw.y ?? DEFAULT_AREA.y),
    width: Number(raw.width ?? DEFAULT_AREA.width),
    height: Number(raw.height ?? DEFAULT_AREA.height),
    rotation: Number(raw.rotation ?? 0),
  };
}

/**
 * Extracts the user's artwork from the fabric scene graph, dropping the garment
 * image and the printable-area guide so reloading never duplicates them.
 */
export function serializeCanvas(canvas: Canvas) {
  const objects = canvas
    .getObjects()
    .filter(
      (object) =>
        !(object as FabricObjectWithFlags).excludeFromExport &&
        !(object as FabricObjectWithFlags).isTemplate
    )
    .map((object) => object.toObject());

  return { objects };
}

/**
 * A small raster preview used in the mockup grid. Kept deliberately tiny so it
 * can be stored inline in demo mode and uploaded cheaply in connected mode.
 */
export function canvasPreview(canvas: Canvas) {
  return canvas.toDataURL({ format: "webp", quality: 0.72, multiplier: 0.45 });
}

/** Triggers a browser download for a data URL or remote URL. */
export function downloadUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportFilename(name: string, format: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "threadforge-mockup"}-${Date.now().toString(36)}.${format.toLowerCase()}`;
}
