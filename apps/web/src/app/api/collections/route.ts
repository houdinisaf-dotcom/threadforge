import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCollections } from "@/lib/data";
import { isDemoMode } from "@/lib/env";
import { demoStore, nextDemoId } from "@/lib/demo-data";
import { createCollectionSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const collections = await getCollections();
  return NextResponse.json({ success: true, data: collections });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid collection", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  if (isDemoMode) {
    const now = new Date();
    const collection = {
      id: nextDemoId("coll"),
      userId: user.id,
      brandId: parsed.data.brandId ?? null,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      coverUrl: null,
      isPublic: parsed.data.isPublic,
      createdAt: now,
      updatedAt: now,
    };

    demoStore.collections.unshift(collection);
    return NextResponse.json(
      { success: true, data: { ...collection, mockups: [] } },
      { status: 201 }
    );
  }

  const { db } = await import("@/lib/db");
  const collection = await db.collection.create({
    data: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json({ success: true, data: collection }, { status: 201 });
}
