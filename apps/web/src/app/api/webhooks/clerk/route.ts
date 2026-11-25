import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserPayload {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  primary_email_address_id: string | null;
  email_addresses: ClerkEmailAddress[];
}

interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUserPayload;
}

/** Keeps the local `User` table in sync with Clerk. */
export async function POST(request: Request) {
  if (isDemoMode) {
    return NextResponse.json({ received: true, mode: "demo" });
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CLERK_WEBHOOK_SECRET is not set" }, { status: 503 });
  }

  const headerList = headers();
  const svixHeaders = {
    "svix-id": headerList.get("svix-id") ?? "",
    "svix-timestamp": headerList.get("svix-timestamp") ?? "",
    "svix-signature": headerList.get("svix-signature") ?? "",
  };

  if (!svixHeaders["svix-id"] || !svixHeaders["svix-signature"]) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  let event: ClerkWebhookEvent;
  try {
    const payload = await request.text();
    event = new Webhook(secret).verify(payload, svixHeaders) as unknown as ClerkWebhookEvent;
  } catch (error) {
    console.error("[clerk] webhook verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { db } = await import("@/lib/db");

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const user = event.data;
        const email =
          user.email_addresses.find((address) => address.id === user.primary_email_address_id)
            ?.email_address ??
          user.email_addresses[0]?.email_address;

        if (!email) {
          return NextResponse.json({ error: "User has no email address" }, { status: 422 });
        }

        const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;

        await db.user.upsert({
          where: { clerkId: user.id },
          create: { clerkId: user.id, email, name, avatarUrl: user.image_url },
          update: { email, name, avatarUrl: user.image_url },
        });
        break;
      }

      case "user.deleted": {
        await db.user.deleteMany({ where: { clerkId: event.data.id } });
        break;
      }
    }
  } catch (error) {
    console.error("[clerk] handler failed", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
