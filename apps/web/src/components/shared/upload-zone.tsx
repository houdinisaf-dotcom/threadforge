"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  label?: string;
}

export function UploadZone({
  onFiles,
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".svg", ".webp"] },
  maxSize = 10 * 1024 * 1024,
  className,
  label = "Drag & drop your design here, or click to browse",
}: UploadZoneProps) {
  const onDrop = useCallback((accepted: File[]) => onFiles(accepted), [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground text-center">{label}</p>
      <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to {Math.round(maxSize / 1024 / 1024)}MB</p>
    </div>
  );
}
