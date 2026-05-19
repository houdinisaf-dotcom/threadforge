import type { Brand, Collection, Export, Mockup, Template, User } from "@prisma/client";

export type { Brand, Collection, Export, Mockup, Template, User };

export type BrandColor = {
  name: string;
  hex: string;
};

export type BrandFont = {
  name: string;
  url?: string;
  family: string;
};

export type DesignArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type MockupWithTemplate = Mockup & { template: Template };
export type MockupWithBrand = Mockup & { brand: Brand | null };
export type MockupFull = Mockup & { template: Template; brand: Brand | null; exports: Export[] };

export type BrandWithMockups = Brand & { mockups: Mockup[] };
export type CollectionWithMockups = Collection & { mockups: (Mockup & { template: Template })[] };

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
