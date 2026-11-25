import { NextResponse } from "next/server";
import { getTemplates } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Public template library — also used by the marketing site's gallery. */
export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category");
  const templates = await getTemplates();

  const filtered = category ? templates.filter((t) => t.category === category) : templates;

  return NextResponse.json({ success: true, data: filtered });
}
