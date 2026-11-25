import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { appUrl, hasStripe, isDemoMode } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode || !hasStripe) {
    return NextResponse.json(
      { error: "Billing is not configured. Add Stripe keys to enable the portal." },
      { status: 503 }
    );
  }

  try {
    const { db } = await import("@/lib/db");
    const subscription = await db.subscription.findUnique({ where: { userId: user.id } });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account yet — start a subscription first." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/dashboard/settings`,
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error("Stripe portal failed", error);
    return NextResponse.json({ error: "Could not open billing portal" }, { status: 500 });
  }
}
