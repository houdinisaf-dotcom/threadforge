import type {
  Brand,
  Collection,
  Export,
  ExportFormat,
  Mockup,
  MockupStatus,
  Plan,
  Prisma,
  Template,
  TemplateCategory,
} from "@prisma/client";
import type { BrandColor, BrandFont, DesignArea } from "@/types";

/**
 * In-memory sample workspace used by demo mode.
 *
 * The data lives on `globalThis` so mutations survive Next.js hot reloads, and
 * because server components and route handlers run in the same Node process it
 * behaves like a tiny database. It is reset whenever the server restarts.
 */

/** Produces ids that look like Prisma cuids so the existing Zod schemas accept them. */
function cuid(seed: string, n: number) {
  const tail = `${seed}${n}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `c${tail.padEnd(24, "0").slice(0, 24)}`;
}

const iso = (daysAgo: number) =>
  new Date(Date.UTC(2026, 10, 20) - daysAgo * 86_400_000);

export const DEMO_USER_ID = cuid("user", 1);

export const DEMO_USER: {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
} = {
  id: DEMO_USER_ID,
  clerkId: "user_demo_threadforge",
  email: "alex@atlassupply.co",
  name: "Alex Rivera",
  avatarUrl: null,
  plan: "FREE" as Plan,
  createdAt: iso(120),
  updatedAt: iso(2),
};

/** Prisma stores these as JSON columns; the cast keeps the literals readable. */
const json = (value: unknown) => value as Prisma.InputJsonValue;

export const DEMO_TEMPLATES: Template[] = [
  {
    id: cuid("tmpl", 1),
    name: "Unisex Tee — White Flat Lay",
    slug: "unisex-tee-white-flat",
    category: "TSHIRT" as TemplateCategory,
    subcategory: "Short sleeve",
    imageUrl: "/templates/tee-white.svg",
    maskUrl: "/templates/tee-white.svg",
    thumbUrl: "/templates/tee-white.svg",
    width: 800,
    height: 800,
    designArea: json({ x: 320, y: 268, width: 160, height: 190, rotation: 0 }),
    tags: ["tshirt", "white", "flat-lay", "unisex"],
    isPremium: false,
    isActive: true,
    sortOrder: 0,
    createdAt: iso(90),
  },
  {
    id: cuid("tmpl", 2),
    name: "Unisex Tee — Black Flat Lay",
    slug: "unisex-tee-black-flat",
    category: "TSHIRT" as TemplateCategory,
    subcategory: "Short sleeve",
    imageUrl: "/templates/tee-black.svg",
    maskUrl: "/templates/tee-black.svg",
    thumbUrl: "/templates/tee-black.svg",
    width: 800,
    height: 800,
    designArea: json({ x: 320, y: 268, width: 160, height: 190, rotation: 0 }),
    tags: ["tshirt", "black", "flat-lay", "unisex"],
    isPremium: false,
    isActive: true,
    sortOrder: 1,
    createdAt: iso(89),
  },
  {
    id: cuid("tmpl", 3),
    name: "Pullover Hoodie — White Flat Lay",
    slug: "hoodie-white-flat",
    category: "HOODIE" as TemplateCategory,
    subcategory: "Pullover",
    imageUrl: "/templates/hoodie-white.svg",
    maskUrl: "/templates/hoodie-white.svg",
    thumbUrl: "/templates/hoodie-white.svg",
    width: 800,
    height: 800,
    designArea: json({ x: 318, y: 300, width: 164, height: 178, rotation: 0 }),
    tags: ["hoodie", "white", "flat-lay", "pullover"],
    isPremium: false,
    isActive: true,
    sortOrder: 2,
    createdAt: iso(80),
  },
  {
    id: cuid("tmpl", 4),
    name: "Snapback Hat — Black",
    slug: "snapback-black",
    category: "HAT" as TemplateCategory,
    subcategory: "Snapback",
    imageUrl: "/templates/cap-black.svg",
    maskUrl: "/templates/cap-black.svg",
    thumbUrl: "/templates/cap-black.svg",
    width: 800,
    height: 800,
    designArea: json({ x: 330, y: 306, width: 140, height: 106, rotation: 0 }),
    tags: ["hat", "snapback", "black", "cap"],
    isPremium: true,
    isActive: true,
    sortOrder: 3,
    createdAt: iso(70),
  },
  {
    id: cuid("tmpl", 5),
    name: "Joggers — Grey Flat Lay",
    slug: "joggers-grey-flat",
    category: "JOGGERS" as TemplateCategory,
    subcategory: "Sweatpants",
    imageUrl: "/templates/joggers-grey.svg",
    maskUrl: "/templates/joggers-grey.svg",
    thumbUrl: "/templates/joggers-grey.svg",
    width: 800,
    height: 800,
    designArea: json({ x: 322, y: 246, width: 148, height: 132, rotation: 0 }),
    tags: ["joggers", "grey", "flat-lay", "pants"],
    isPremium: true,
    isActive: true,
    sortOrder: 4,
    createdAt: iso(60),
  },
];

export const DEMO_BRANDS: Brand[] = [
  {
    id: cuid("brand", 1),
    userId: DEMO_USER_ID,
    name: "Atlas Supply Co.",
    slug: "atlas-supply-co",
    logoUrl: null,
    colors: json([
      { name: "Bone", hex: "#F4F1EA" },
      { name: "Ink", hex: "#111111" },
      { name: "Rust", hex: "#B4532A" },
    ] satisfies BrandColor[]),
    fonts: json([
      { name: "Geist", family: "Geist", url: undefined },
      { name: "Space Grotesk", family: "Space Grotesk", url: undefined },
    ] satisfies BrandFont[]),
    description: "Outdoor-inspired streetwear made in small batches.",
    website: "https://atlassupply.co",
    instagram: "atlassupply",
    createdAt: iso(100),
    updatedAt: iso(4),
  },
  {
    id: cuid("brand", 2),
    userId: DEMO_USER_ID,
    name: "Night Shift",
    slug: "night-shift",
    logoUrl: null,
    colors: json([
      { name: "Midnight", hex: "#2F4858" },
      { name: "Dusk", hex: "#7A8B99" },
      { name: "Amber", hex: "#E6A04B" },
    ] satisfies BrandColor[]),
    fonts: json([{ name: "Geist", family: "Geist" }] satisfies BrandFont[]),
    description: "Late-night capsule for the after-hours crowd.",
    website: null,
    instagram: "nightshift.studio",
    createdAt: iso(45),
    updatedAt: iso(9),
  },
];

const mockup = (
  n: number,
  name: string,
  templateId: string,
  brandId: string | null,
  previewUrl: string,
  status: MockupStatus,
  daysAgo: number
): Mockup => ({
  id: cuid("mock", n),
  userId: DEMO_USER_ID,
  brandId,
  templateId,
  name,
  canvasJson: {},
  previewUrl,
  status,
  createdAt: iso(daysAgo + 3),
  updatedAt: iso(daysAgo),
});

export const DEMO_MOCKUPS: Mockup[] = [
  mockup(
    1,
    "Atlas Summit Tee",
    DEMO_TEMPLATES[0].id,
    DEMO_BRANDS[0].id,
    "/mockups/atlas-tee-white.svg",
    "PUBLISHED" as MockupStatus,
    1
  ),
  mockup(
    2,
    "Atlas Badge Tee — Black",
    DEMO_TEMPLATES[1].id,
    DEMO_BRANDS[0].id,
    "/mockups/atlas-badge-tee-black.svg",
    "PUBLISHED" as MockupStatus,
    2
  ),
  mockup(
    3,
    "Night Shift Hoodie",
    DEMO_TEMPLATES[2].id,
    DEMO_BRANDS[1].id,
    "/mockups/night-shift-hoodie.svg",
    "DRAFT" as MockupStatus,
    5
  ),
  mockup(
    4,
    "Night Shift Snapback",
    DEMO_TEMPLATES[3].id,
    DEMO_BRANDS[1].id,
    "/mockups/night-shift-cap.svg",
    "PUBLISHED" as MockupStatus,
    6
  ),
  mockup(
    5,
    "Trail Joggers",
    DEMO_TEMPLATES[4].id,
    DEMO_BRANDS[0].id,
    "/mockups/trail-joggers.svg",
    "DRAFT" as MockupStatus,
    8
  ),
  mockup(
    6,
    "OG Logo Tee",
    DEMO_TEMPLATES[0].id,
    DEMO_BRANDS[0].id,
    "/mockups/og-logo-tee.svg",
    "DRAFT" as MockupStatus,
    11
  ),
];

export const DEMO_COLLECTIONS: Collection[] = [
  {
    id: cuid("coll", 1),
    userId: DEMO_USER_ID,
    brandId: DEMO_BRANDS[0].id,
    name: "AW26 Drop 01",
    description: "Autumn/winter launch — tees first, joggers to follow.",
    coverUrl: "/mockups/atlas-tee-white.svg",
    isPublic: true,
    createdAt: iso(30),
    updatedAt: iso(3),
  },
  {
    id: cuid("coll", 2),
    userId: DEMO_USER_ID,
    brandId: DEMO_BRANDS[1].id,
    name: "Night Shift Capsule",
    description: "Hoodie + snapback lookbook for the pre-order page.",
    coverUrl: "/mockups/night-shift-hoodie.svg",
    isPublic: false,
    createdAt: iso(20),
    updatedAt: iso(7),
  },
];

export const DEMO_COLLECTION_MOCKUPS: {
  collectionId: string;
  mockupId: string;
  order: number;
}[] = [
  { collectionId: DEMO_COLLECTIONS[0].id, mockupId: DEMO_MOCKUPS[0].id, order: 0 },
  { collectionId: DEMO_COLLECTIONS[0].id, mockupId: DEMO_MOCKUPS[1].id, order: 1 },
  { collectionId: DEMO_COLLECTIONS[1].id, mockupId: DEMO_MOCKUPS[2].id, order: 0 },
  { collectionId: DEMO_COLLECTIONS[1].id, mockupId: DEMO_MOCKUPS[3].id, order: 1 },
];

export const DEMO_EXPORTS: Export[] = [
  {
    id: cuid("exp", 1),
    userId: DEMO_USER_ID,
    mockupId: DEMO_MOCKUPS[0].id,
    format: "PNG" as Export["format"],
    width: 2000,
    height: 2000,
    url: "/mockups/atlas-tee-white.svg",
    fileSize: 486_213,
    createdAt: iso(1),
  },
  {
    id: cuid("exp", 2),
    userId: DEMO_USER_ID,
    mockupId: DEMO_MOCKUPS[3].id,
    format: "WEBP" as Export["format"],
    width: 1600,
    height: 1600,
    url: "/mockups/night-shift-cap.svg",
    fileSize: 212_004,
    createdAt: iso(4),
  },
];

interface DemoStore {
  templates: Template[];
  mockups: Mockup[];
  brands: Brand[];
  collections: Collection[];
  collectionMockups: { collectionId: string; mockupId: string; order: number }[];
  exports: Export[];
}

const globalForDemo = globalThis as unknown as { __threadforgeDemo?: DemoStore };

export const demoStore: DemoStore =
  globalForDemo.__threadforgeDemo ??
  (globalForDemo.__threadforgeDemo = {
    templates: [...DEMO_TEMPLATES],
    mockups: [...DEMO_MOCKUPS],
    brands: [...DEMO_BRANDS],
    collections: [...DEMO_COLLECTIONS],
    collectionMockups: [...DEMO_COLLECTION_MOCKUPS],
    exports: [...DEMO_EXPORTS],
  });

/** Creates a fresh id in the same shape Prisma would generate. */
export function nextDemoId(prefix: string) {
  const random = `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
  return cuid(random, 0);
}
