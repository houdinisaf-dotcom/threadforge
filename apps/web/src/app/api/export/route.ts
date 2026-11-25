import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isDemoMode, hasCloudinary } from "@/lib/env";
import { demoStore, nextDemoId } from "@/lib/demo-data";
import { exportMockupSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/**
 * Records an export and, when Cloudinary is configured, stores the rendered
 * image so the export has a durable, shareable URL.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = exportMockupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid export", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { mockupId, format, width, dataUrl } = parsed.data;

  if (isDemoMode) {
    const mockup = demoStore.mockups.find(
      (item) => item.id === mockupId && item.userId === user.id
    );
    if (!mockup) return NextResponse.json({ error: "Mockup not found" }, { status: 404 });

    demoStore.exports.unshift({
      id: nextDemoId("exp"),
      userId: user.id,
      mockupId,
      format,
      width,
      height: width,
      url: mockup.previewUrl ?? "",
      fileSize: null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, data: { url: null, recorded: true } });
  }

  const { db } = await import("@/lib/db");
  const mockup = await db.mockup.findFirst({
    where: { id: mockupId, userId: user.id },
    select: { id: true },
  });
  if (!mockup) return NextResponse.json({ error: "Mockup not found" }, { status: 404 });

  let url: string | null = null;
  let fileSize: number | null = null;

  if (dataUrl && hasCloudinary) {
    const { uploadDesign } = await import("@/lib/cloudinary");
    const uploaded = await uploadDesign(dataUrl, "exports");
    url = uploaded.url;
    fileSize = Math.round((dataUrl.length * 3) / 4);
  } else {
    return NextResponse.json(
      { error: "Image storage is not configured (set CLOUDINARY_* env vars)" },
      { status: 503 }
    );
  }

  const record = await db.export.create({
    data: {
      userId: user.id,
      mockupId,
      format,
      width,
      height: width,
      url,
      fileSize,
    },
  });

  await db.mockup.update({
    where: { id: mockupId },
    data: { previewUrl: url },
  });

  return NextResponse.json({ success: true, data: { ...record, url } }, { status: 201 });
}
