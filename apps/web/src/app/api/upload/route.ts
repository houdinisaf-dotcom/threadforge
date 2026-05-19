import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { uploadDesign } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { base64, folder } = body as { base64: string; folder?: string };

  if (!base64) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const result = await uploadDesign(base64, folder ?? "designs");

  return NextResponse.json({ success: true, data: result });
}
