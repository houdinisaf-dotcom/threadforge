import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createBrandSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const brands = await db.brand.findMany({
    where: { userId: user.id },
    include: { _count: { select: { mockups: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, data: brands });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createBrandSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const slug = slugify(parsed.data.name);

  const brand = await db.brand.create({
    data: { ...parsed.data, userId: user.id, slug },
  });

  return NextResponse.json({ success: true, data: brand }, { status: 201 });
}
