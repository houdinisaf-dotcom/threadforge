import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().max(64).optional(),
  colors: z
    .array(z.object({ name: z.string(), hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/) }))
    .max(10)
    .default([]),
});

export const createMockupSchema = z.object({
  name: z.string().min(1).max(128),
  templateId: z.string().cuid(),
  brandId: z.string().cuid().optional(),
  canvasJson: z.record(z.unknown()),
});

export const updateMockupSchema = createMockupSchema.partial().extend({
  id: z.string().cuid(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  previewUrl: z.string().url().optional(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().max(500).optional(),
  brandId: z.string().cuid().optional(),
  isPublic: z.boolean().default(false),
});

export const exportMockupSchema = z.object({
  mockupId: z.string().cuid(),
  format: z.enum(["PNG", "WEBP", "PDF"]),
  width: z.number().int().min(400).max(6000).default(2000),
});
