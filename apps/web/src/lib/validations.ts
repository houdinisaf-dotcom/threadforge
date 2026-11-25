import { z } from "zod";

const cuid = z.string().cuid();
const mockupStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createBrandSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().max(64).optional(),
  colors: z
    .array(z.object({ name: z.string().max(32), hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/) }))
    .max(10)
    .default([]),
});

export const createMockupSchema = z.object({
  name: z.string().min(1).max(128),
  templateId: cuid,
  brandId: cuid.optional(),
  status: mockupStatus.optional(),
  canvasJson: z.record(z.unknown()),
  previewDataUrl: z.string().optional(),
});

export const updateMockupSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  templateId: cuid.optional(),
  brandId: cuid.nullish(),
  status: mockupStatus.optional(),
  canvasJson: z.record(z.unknown()).optional(),
  previewDataUrl: z.string().optional(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().max(500).optional(),
  brandId: cuid.optional(),
  isPublic: z.boolean().default(false),
});

export const exportMockupSchema = z.object({
  mockupId: cuid,
  format: z.enum(["PNG", "WEBP", "PDF"]),
  width: z.number().int().min(400).max(6000).default(2000),
  dataUrl: z
    .string()
    .startsWith("data:image/", { message: "Expected a canvas data URL" })
    .optional(),
});

export const checkoutSchema = z.object({
  plan: z.enum(["PRO", "STUDIO"]),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type CreateMockupInput = z.infer<typeof createMockupSchema>;
export type UpdateMockupInput = z.infer<typeof updateMockupSchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
