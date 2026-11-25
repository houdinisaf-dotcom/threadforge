import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { getBrands } from "@/lib/data";
import { isDemoMode } from "@/lib/env";
import { demoStore, nextDemoId } from "@/lib/demo-data";
import { createBrandSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const brands = await getBrands();
  return NextResponse.json({ success: true, data: brands });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createBrandSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid brand", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, colors, description, instagram, website } = parsed.data;
  const slug = slugify(name) || `brand-${Date.now().toString(36)}`;

  if (isDemoMode) {
    const taken = demoStore.brands.some((brand) => brand.userId === user.id && brand.slug === slug);
    if (taken) {
      return NextResponse.json({ error: "A brand with that name already exists" }, { status: 409 });
    }

    const now = new Date();
    const brand = {
      id: nextDemoId("brand"),
      userId: user.id,
      name,
      slug,
      logoUrl: null,
      colors: colors as unknown as Prisma.JsonValue,
      fonts: [] as unknown as Prisma.JsonValue,
      description: description || null,
      website: website || null,
      instagram: instagram?.replace(/^@/, "") || null,
      createdAt: now,
      updatedAt: now,
    };

    demoStore.brands.push(brand);
    return NextResponse.json(
      { success: true, data: { ...brand, _count: { mockups: 0 } } },
      { status: 201 }
    );
  }

  const { db } = await import("@/lib/db");
  const existing = await db.brand.findFirst({ where: { userId: user.id, slug } });
  if (existing) {
    return NextResponse.json({ error: "A brand with that name already exists" }, { status: 409 });
  }

  const brand = await db.brand.create({
    data: {
      userId: user.id,
      name,
      slug,
      colors: colors as unknown as Prisma.InputJsonValue,
      description: description || null,
      website: website || null,
      instagram: instagram?.replace(/^@/, "") || null,
    },
  });

  return NextResponse.json({ success: true, data: brand }, { status: 201 });
}
