"use client";

import { useCallback, useRef } from "react";
import type { Canvas } from "fabric";
import { FabricImage, FabricText } from "fabric";
import {
  Bold,
  ImagePlus,
  Italic,
  Minus,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseDesignArea } from "@/lib/editor";
import type { Template } from "@/types";

interface EditorToolbarProps {
  canvas: Canvas | null;
  template: Template;
  onDirty?: () => void;
}

export function EditorToolbar({ canvas, template, onDirty }: EditorToolbarProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  const addText = useCallback(() => {
    if (!canvas) return;
    const area = parseDesignArea(template);
    const text = new FabricText("Your text", {
      left: area.x + area.width / 2,
      top: area.y + area.height / 2,
      originX: "center",
      originY: "center",
      fontSize: 44,
      fill: "#111111",
      fontFamily: "Inter, Helvetica, Arial, sans-serif",
      fontWeight: "600",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    onDirty?.();
  }, [canvas, template, onDirty]);

  const addImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!canvas || !file) return;

      const url = URL.createObjectURL(file);
      try {
        const image = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
        const area = parseDesignArea(template);
        image.scaleToWidth(Math.min(area.width, 320));
        image.set({
          left: area.x + area.width / 2,
          top: area.y + area.height / 2,
          originX: "center",
          originY: "center",
        });
        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.renderAll();
        onDirty?.();
      } finally {
        URL.revokeObjectURL(url);
        event.target.value = "";
      }
    },
    [canvas, template, onDirty]
  );

  const resizeActiveText = useCallback(
    (delta: number) => {
      const active = canvas?.getActiveObject() as FabricText | undefined;
      if (!canvas || !active || !("fontSize" in active)) return;
      active.set({ fontSize: Math.max(10, Math.min(220, (active.fontSize ?? 40) + delta)) });
      canvas.requestRenderAll();
      onDirty?.();
    },
    [canvas, onDirty]
  );

  const toggleActiveTextStyle = useCallback(
    (property: "bold" | "italic") => {
      const active = canvas?.getActiveObject() as FabricText | undefined;
      if (!canvas || !active || !("fontWeight" in active)) return;

      if (property === "bold") {
        active.set({ fontWeight: active.fontWeight === "bold" ? "normal" : "bold" });
      } else {
        active.set({ fontStyle: active.fontStyle === "italic" ? "normal" : "italic" });
      }
      canvas.requestRenderAll();
      onDirty?.();
    },
    [canvas, onDirty]
  );

  const deleteSelected = useCallback(() => {
    if (!canvas) return;
    canvas.getActiveObjects().forEach((object) => canvas.remove(object));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    onDirty?.();
  }, [canvas, onDirty]);

  const bringForward = useCallback(() => {
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    canvas.bringObjectForward(active);
    canvas.requestRenderAll();
    onDirty?.();
  }, [canvas, onDirty]);

  const sendBackward = useCallback(() => {
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    canvas.sendObjectBackwards(active);
    canvas.requestRenderAll();
    onDirty?.();
  }, [canvas, onDirty]);

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border bg-background p-1.5 shadow-sm">
      <Button variant="ghost" size="icon" onClick={addText} title="Add text">
        <Type className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInput.current?.click()}
        title="Add image"
      >
        <ImagePlus className="h-4 w-4" />
      </Button>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={addImage}
      />

      <div className="mx-1 h-5 w-px bg-border" />

      <Button variant="ghost" size="icon" onClick={() => resizeActiveText(-6)} title="Smaller text">
        <Minus className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => resizeActiveText(6)} title="Larger text">
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => toggleActiveTextStyle("bold")} title="Bold">
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleActiveTextStyle("italic")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-border" />

      <Button variant="ghost" size="icon" onClick={bringForward} title="Bring forward">
        <MoveUp className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={sendBackward} title="Send backward">
        <MoveDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={deleteSelected} title="Delete selected">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
