import { PrismaClient, TemplateCategory } from "@prisma/client";

const db = new PrismaClient();

const templates = [
  {
    name: "Unisex Tee — White Flat Lay",
    slug: "unisex-tee-white-flat",
    category: TemplateCategory.TSHIRT,
    imageUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/tee-white-flat.png",
    maskUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/tee-white-flat-mask.png",
    thumbUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/tee-white-flat-thumb.png",
    designArea: { x: 680, y: 420, width: 640, height: 680, rotation: 0 },
    tags: ["tshirt", "white", "flat-lay", "unisex"],
  },
  {
    name: "Unisex Tee — Black Flat Lay",
    slug: "unisex-tee-black-flat",
    category: TemplateCategory.TSHIRT,
    imageUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/tee-black-flat.png",
    maskUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/tee-black-flat-mask.png",
    thumbUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/tee-black-flat-thumb.png",
    designArea: { x: 680, y: 420, width: 640, height: 680, rotation: 0 },
    tags: ["tshirt", "black", "flat-lay", "unisex"],
  },
  {
    name: "Pullover Hoodie — White Flat Lay",
    slug: "hoodie-white-flat",
    category: TemplateCategory.HOODIE,
    imageUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/hoodie-white-flat.png",
    maskUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/hoodie-white-flat-mask.png",
    thumbUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/hoodie-white-flat-thumb.png",
    designArea: { x: 720, y: 380, width: 560, height: 560, rotation: 0 },
    tags: ["hoodie", "white", "flat-lay", "pullover"],
  },
  {
    name: "Snapback Hat — Black",
    slug: "snapback-black",
    category: TemplateCategory.HAT,
    imageUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/snapback-black.png",
    maskUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/snapback-black-mask.png",
    thumbUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/snapback-black-thumb.png",
    designArea: { x: 560, y: 260, width: 880, height: 360, rotation: 0 },
    tags: ["hat", "snapback", "black", "cap"],
  },
  {
    name: "Joggers — Gray Flat Lay",
    slug: "joggers-gray-flat",
    category: TemplateCategory.JOGGERS,
    imageUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/joggers-gray-flat.png",
    maskUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/joggers-gray-flat-mask.png",
    thumbUrl: "https://res.cloudinary.com/threadforge/image/upload/templates/joggers-gray-flat-thumb.png",
    designArea: { x: 800, y: 200, width: 400, height: 300, rotation: 0 },
    tags: ["joggers", "gray", "flat-lay", "pants"],
  },
];

async function main() {
  console.log("Seeding templates...");

  for (const t of templates) {
    await db.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: { ...t, width: 2000, height: 2000 },
    });
  }

  console.log(`Seeded ${templates.length} templates.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
