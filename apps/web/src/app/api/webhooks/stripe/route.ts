import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { SubscriptionStatus } from "@prisma/client";
import { getStripe, PLANS } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Stripe subscription statuses mapped onto the Prisma enum. */
const STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: "ACTIVE",
  trialing: "TRIALING",
  past_due: "PAST_DUE",
  unpaid: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INACTIVE",
  incomplete_expired: "INACTIVE",
  paused: "INACTIVE",
};

function planForPrice(priceId: string | null) {
  if (priceId && priceId === PLANS.STUDIO.priceId) return "STUDIO" as const;
  if (priceId && priceId === PLANS.PRO.priceId) return "PRO" as const;
  return "FREE" as const;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const { db } = await import("@/lib/db");
  const customerId = String(subscription.customer);
  const priceId = subscription.items.data[0]?.price.id ?? null;

  // Prefer the user id attached at checkout, fall back to the stored customer.
  const userId =
    subscription.metadata.userId ??
    (await db.subscription.findUnique({ where: { stripeCustomerId: customerId } }))?.userId;

  if (!userId) {
    console.warn(`[stripe] no user for customer ${customerId}`);
    return;
  }

  const data = {
    stripeSubId: subscription.id,
    stripePriceId: priceId,
    status: STATUS_MAP[subscription.status] ?? "INACTIVE",
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  await db.subscription.upsert({
    where: { stripeCustomerId: customerId },
    create: { userId, stripeCustomerId: customerId, ...data },
    update: data,
  });

  await db.user.update({
    where: { id: userId },
    data: { plan: planForPrice(priceId) },
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("[stripe] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.resumed": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = String(subscription.customer);
        const { db } = await import("@/lib/db");

        const record = await db.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "CANCELED", cancelAtPeriodEnd: true },
        });
        if (record) {
          await db.user.update({ where: { id: record.userId }, data: { plan: "FREE" } });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subscription = await getStripe().subscriptions.retrieve(
            String(session.subscription)
          );
          await syncSubscription(subscription);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.customer) break;
        const { db } = await import("@/lib/db");
        await db.subscription.updateMany({
          where: { stripeCustomerId: String(invoice.customer) },
          data: { status: "PAST_DUE" },
        });
        break;
      }
    }
  } catch (error) {
    console.error("[stripe] handler failed", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
