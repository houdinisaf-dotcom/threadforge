import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { getMockup } from "@/lib/data";
import { isDemoMode } from "@/lib/env";
import { demoStore } from "@/lib/demo-data";
import { storePreview } from "@/lib/preview";
import { updateMockupSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mockup = await getMockup(params.id);
  if (!mockup) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: mockup });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateMockupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid mockup", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { previewDataUrl, ...input } = parsed.data;

  if (isDemoMode) {
    const mockup = demoStore.mockups.find(
      (item) => item.id === params.id && item.userId === user.id
    );
    if (!mockup) return NextResponse.json({ error: "Not found" }, { status: 404 });

    Object.assign(mockup, input, { updatedAt: new Date() });
    return NextResponse.json({ success: true, data: mockup });
  }

  const { db } = await import("@/lib/db");
  const existing = await db.mockup.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const previewUrl = await storePreview(previewDataUrl);

  const mockup = await db.mockup.update({
    where: { id: params.id },
    data: {
      ...input,
      ...(input.canvasJson ? { canvasJson: input.canvasJson as Prisma.InputJsonValue } : {}),
      ...(previewUrl ? { previewUrl } : {}),
    },
    include: { template: true },
  });

  return NextResponse.json({ success: true, data: mockup });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode) {
    const index = demoStore.mockups.findIndex(
      (item) => item.id === params.id && item.userId === user.id
    );
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    demoStore.mockups.splice(index, 1);
    demoStore.collectionMockups = demoStore.collectionMockups.filter(
      (link) => link.mockupId !== params.id
    );
    return NextResponse.json({ success: true, data: { id: params.id } });
  }

  const { db } = await import("@/lib/db");
  const existing = await db.mockup.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.mockup.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, data: { id: params.id } });
}
