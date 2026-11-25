import { unstable_noStore as noStore } from "next/cache";
import { isDemoMode } from "./env";
import { getCurrentUser } from "./auth";
import { demoStore } from "./demo-data";
import type {
  Brand,
  Collection,
  Export,
  Mockup,
  Template,
} from "@prisma/client";
import type { CollectionWithMockups, MockupFull, MockupWithTemplate } from "@/types";

/**
 * Server-side data access.
 *
 * Every function works in both modes: connected mode queries Prisma for the
 * signed-in user, demo mode reads the in-memory sample workspace. Pages call
 * these helpers instead of talking to Prisma directly.
 */

const byNewest = (a: Mockup, b: Mockup) => b.updatedAt.getTime() - a.updatedAt.getTime();

export async function getTemplates(): Promise<Template[]> {
  noStore();
  if (isDemoMode) {
    return [...demoStore.templates]
      .filter((template) => template.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const { db } = await import("./db");
  return db.template.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getTemplatesByCategory() {
  const templates = await getTemplates();
  return templates.reduce<Record<string, Template[]>>((acc, template) => {
    (acc[template.category] ??= []).push(template);
    return acc;
  }, {});
}

export async function getMockups(): Promise<MockupWithTemplate[]> {
  noStore();
  const user = await getCurrentUser();
  if (!user) return [];

  if (isDemoMode) {
    return demoStore.mockups
      .filter((mockup) => mockup.userId === user.id)
      .sort(byNewest)
      .map((mockup) => ({
        ...mockup,
        template:
          demoStore.templates.find((template) => template.id === mockup.templateId) ??
          demoStore.templates[0],
      }));
  }

  const { db } = await import("./db");
  return db.mockup.findMany({
    where: { userId: user.id },
    include: { template: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getMockup(id: string): Promise<MockupFull | null> {
  noStore();
  const user = await getCurrentUser();
  if (!user) return null;

  if (isDemoMode) {
    const mockup = demoStore.mockups.find(
      (item) => item.id === id && item.userId === user.id
    );
    if (!mockup) return null;
    const template =
      demoStore.templates.find((item) => item.id === mockup.templateId) ?? demoStore.templates[0];
    const brand = demoStore.brands.find((item) => item.id === mockup.brandId) ?? null;
    const exports = demoStore.exports.filter((item) => item.mockupId === mockup.id);
    return { ...mockup, template, brand, exports };
  }

  const { db } = await import("./db");
  return db.mockup.findFirst({
    where: { id, userId: user.id },
    include: { template: true, brand: true, exports: { orderBy: { createdAt: "desc" } } },
  });
}

export type BrandWithMockupCount = Brand & { _count: { mockups: number } };

export async function getBrands(): Promise<BrandWithMockupCount[]> {
  noStore();
  const user = await getCurrentUser();
  if (!user) return [];

  if (isDemoMode) {
    return demoStore.brands
      .filter((brand) => brand.userId === user.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((brand) => ({
        ...brand,
        _count: { mockups: demoStore.mockups.filter((m) => m.brandId === brand.id).length },
      }));
  }

  const { db } = await import("./db");
  return db.brand.findMany({
    where: { userId: user.id },
    include: { _count: { select: { mockups: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCollections(): Promise<CollectionWithMockups[]> {
  noStore();
  const user = await getCurrentUser();
  if (!user) return [];

  if (isDemoMode) {
    return demoStore.collections
      .filter((collection) => collection.userId === user.id)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map((collection) => ({
        ...collection,
        mockups: demoStore.collectionMockups
          .filter((link) => link.collectionId === collection.id)
          .sort((a, b) => a.order - b.order)
          .map((link) => demoStore.mockups.find((m) => m.id === link.mockupId))
          .filter((m): m is Mockup => Boolean(m))
          .map((m) => ({
            ...m,
            template:
              demoStore.templates.find((t) => t.id === m.templateId) ?? demoStore.templates[0],
          })),
      }));
  }

  const { db } = await import("./db");
  return db.collection.findMany({
    where: { userId: user.id },
    include: {
      mockups: {
        orderBy: { order: "asc" },
        include: { mockup: { include: { template: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  }).then((collections: PrismaCollectionWithLinks[]) =>
    collections.map((collection) => ({
      ...collection,
      mockups: collection.mockups.map((link) => link.mockup),
    }))
  );
}

type PrismaCollectionWithLinks = Collection & {
  mockups: { order: number; mockup: Mockup & { template: Template } }[];
};

export async function getExports(): Promise<Export[]> {
  noStore();
  const user = await getCurrentUser();
  if (!user) return [];

  if (isDemoMode) {
    return demoStore.exports
      .filter((item) => item.userId === user.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const { db } = await import("./db");
  return db.export.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getUsage() {
  const [mockups, exports] = await Promise.all([getMockups(), getExports()]);
  return {
    mockups: mockups.length,
    exports: exports.length,
    lastUpdated: mockups[0]?.updatedAt ?? null,
  };
}

export type CollectionSummary = Awaited<ReturnType<typeof getCollections>>[number];
export type TemplateRecord = Template;
export type BrandRecord = Brand;
export type CollectionRecord = Collection;
