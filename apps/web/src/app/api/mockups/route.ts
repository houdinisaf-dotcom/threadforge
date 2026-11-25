import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { getMockups } from "@/lib/data";
import { isDemoMode } from "@/lib/env";
import { demoStore, nextDemoId } from "@/lib/demo-data";
import { storePreview } from "@/lib/preview";
import { createMockupSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mockups = await getMockups();
  return NextResponse.json({ success: true, data: mockups });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createMockupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid mockup", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { previewDataUrl, ...input } = parsed.data;

  if (isDemoMode) {
    const template = demoStore.templates.find((item) => item.id === input.templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const now = new Date();
    const mockup = {
      id: nextDemoId("mock"),
      userId: user.id,
      brandId: input.brandId ?? null,
      templateId: input.templateId,
      name: input.name,
      canvasJson: input.canvasJson as Prisma.JsonValue,
      previewUrl: template.thumbUrl,
      status: input.status ?? ("DRAFT" as const),
      createdAt: now,
      updatedAt: now,
    };

    demoStore.mockups.unshift(mockup);
    return NextResponse.json({ success: true, data: { ...mockup, template } }, { status: 201 });
  }

  const { db } = await import("@/lib/db");
  const previewUrl = await storePreview(previewDataUrl);

  const mockup = await db.mockup.create({
    data: {
      name: input.name,
      templateId: input.templateId,
      brandId: input.brandId,
      status: input.status,
      canvasJson: input.canvasJson as Prisma.InputJsonValue,
      previewUrl,
      userId: user.id,
    },
    include: { template: true },
  });

  return NextResponse.json({ success: true, data: mockup }, { status: 201 });
}
