import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { appUrl, hasStripe, isDemoMode } from "@/lib/env";
import { getStripe, PLANS } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode || !hasStripe) {
    return NextResponse.json(
      { error: "Billing is not configured. Add Stripe keys to enable checkout." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 422 });
  }

  const plan = PLANS[parsed.data.plan];
  if (!plan.priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for the ${plan.name} plan` },
      { status: 503 }
    );
  }

  try {
    const stripe = getStripe();
    const { db } = await import("@/lib/db");

    const subscription = await db.subscription.findUnique({ where: { userId: user.id } });

    let customerId = subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await db.subscription.upsert({
        where: { userId: user.id },
        create: { userId: user.id, stripeCustomerId: customerId },
        update: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/settings?checkout=success`,
      cancel_url: `${appUrl}/dashboard/settings?checkout=cancelled`,
      metadata: { userId: user.id, plan: parsed.data.plan },
      subscription_data: { metadata: { userId: user.id, plan: parsed.data.plan } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error("Stripe checkout failed", error);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
