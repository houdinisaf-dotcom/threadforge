import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Lazily creates the Stripe client so the app (and the build) works without
 * Stripe credentials configured — demo mode never needs them.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured: set STRIPE_SECRET_KEY to enable billing.");
  }

  client ??= new Stripe(key, { apiVersion: "2024-06-20", typescript: true });
  return client;
}

export const PLANS = {
  FREE: {
    name: "Free",
    mockupsPerMonth: 10,
    brandsLimit: 1,
    exportsPerMonth: 5,
    priceId: null,
    price: 0,
  },
  PRO: {
    name: "Pro",
    mockupsPerMonth: 200,
    brandsLimit: 5,
    exportsPerMonth: 100,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    price: 19,
  },
  STUDIO: {
    name: "Studio",
    mockupsPerMonth: Number.POSITIVE_INFINITY,
    brandsLimit: Number.POSITIVE_INFINITY,
    exportsPerMonth: Number.POSITIVE_INFINITY,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID ?? null,
    price: 49,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PLAN_ORDER: PlanKey[] = ["FREE", "PRO", "STUDIO"];

export const PLAN_FEATURES: Record<PlanKey, string[]> = {
  FREE: ["10 mockups / month", "1 brand kit", "5 exports / month", "PNG + WebP export"],
  PRO: [
    "200 mockups / month",
    "5 brand kits",
    "100 exports / month",
    "Priority template drops",
  ],
  STUDIO: [
    "Unlimited mockups",
    "Unlimited brand kits",
    "Unlimited exports",
    "Early access to new garments",
  ],
};

export async function createOrRetrieveCustomer(email: string, userId: string) {
  const stripe = getStripe();
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0];

  return stripe.customers.create({ email, metadata: { userId } });
}
