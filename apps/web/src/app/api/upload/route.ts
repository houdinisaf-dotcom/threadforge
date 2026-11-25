import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasCloudinary } from "@/lib/env";

export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasCloudinary) {
    return NextResponse.json(
      { error: "Image storage is not configured (set CLOUDINARY_* env vars)" },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { base64?: string; folder?: string }
    | null;

  const base64 = body?.base64;
  if (!base64 || !base64.startsWith("data:image/")) {
    return NextResponse.json({ error: "Expected an image data URL" }, { status: 400 });
  }

  // Base64 is ~4/3 of the binary size.
  if (base64.length * 0.75 > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 10 MB" }, { status: 413 });
  }

  try {
    const { uploadDesign } = await import("@/lib/cloudinary");
    const folder = body?.folder?.replace(/[^a-z0-9-]/gi, "") || "designs";
    const result = await uploadDesign(base64, folder);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[upload] failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
