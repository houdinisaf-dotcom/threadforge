import { PrismaClient, TemplateCategory } from "@prisma/client";

const db = new PrismaClient();

/**
 * The template library. Artwork lives in `public/templates/*.svg` and is
 * regenerated with `npm run assets` (see scripts/generate-assets.mjs), so a
 * seeded database works offline with no Cloudinary account.
 *
 * Replace `imageUrl` / `maskUrl` with Cloudinary URLs once you upload your own
 * photography — the editor only needs a garment image plus a design area.
 */
const templates = [
  {
    name: "Unisex Tee — White Flat Lay",
    slug: "unisex-tee-white-flat",
    category: TemplateCategory.TSHIRT,
    subcategory: "Short sleeve",
    imageUrl: "/templates/tee-white.svg",
    maskUrl: "/templates/tee-white.svg",
    thumbUrl: "/templates/tee-white.svg",
    designArea: { x: 320, y: 268, width: 160, height: 190, rotation: 0 },
    tags: ["tshirt", "white", "flat-lay", "unisex"],
    isPremium: false,
    sortOrder: 0,
  },
  {
    name: "Unisex Tee — Black Flat Lay",
    slug: "unisex-tee-black-flat",
    category: TemplateCategory.TSHIRT,
    subcategory: "Short sleeve",
    imageUrl: "/templates/tee-black.svg",
    maskUrl: "/templates/tee-black.svg",
    thumbUrl: "/templates/tee-black.svg",
    designArea: { x: 320, y: 268, width: 160, height: 190, rotation: 0 },
    tags: ["tshirt", "black", "flat-lay", "unisex"],
    isPremium: false,
    sortOrder: 1,
  },
  {
    name: "Pullover Hoodie — White Flat Lay",
    slug: "hoodie-white-flat",
    category: TemplateCategory.HOODIE,
    subcategory: "Pullover",
    imageUrl: "/templates/hoodie-white.svg",
    maskUrl: "/templates/hoodie-white.svg",
    thumbUrl: "/templates/hoodie-white.svg",
    designArea: { x: 318, y: 300, width: 164, height: 178, rotation: 0 },
    tags: ["hoodie", "white", "flat-lay", "pullover"],
    isPremium: false,
    sortOrder: 2,
  },
  {
    name: "Snapback Hat — Black",
    slug: "snapback-black",
    category: TemplateCategory.HAT,
    subcategory: "Snapback",
    imageUrl: "/templates/cap-black.svg",
    maskUrl: "/templates/cap-black.svg",
    thumbUrl: "/templates/cap-black.svg",
    designArea: { x: 330, y: 306, width: 140, height: 106, rotation: 0 },
    tags: ["hat", "snapback", "black", "cap"],
    isPremium: true,
    sortOrder: 3,
  },
  {
    name: "Joggers — Grey Flat Lay",
    slug: "joggers-grey-flat",
    category: TemplateCategory.JOGGERS,
    subcategory: "Sweatpants",
    imageUrl: "/templates/joggers-grey.svg",
    maskUrl: "/templates/joggers-grey.svg",
    thumbUrl: "/templates/joggers-grey.svg",
    designArea: { x: 322, y: 246, width: 148, height: 132, rotation: 0 },
    tags: ["joggers", "grey", "flat-lay", "pants"],
    isPremium: true,
    sortOrder: 4,
  },
];

async function main() {
  console.log("Seeding templates...");

  for (const template of templates) {
    await db.template.upsert({
      where: { slug: template.slug },
      update: {
        name: template.name,
        category: template.category,
        imageUrl: template.imageUrl,
        maskUrl: template.maskUrl,
        thumbUrl: template.thumbUrl,
        designArea: template.designArea,
        tags: template.tags,
        isPremium: template.isPremium,
        sortOrder: template.sortOrder,
        isActive: true,
      },
      create: { ...template, width: 800, height: 800 },
    });
  }

  console.log(`Seeded ${templates.length} templates.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
