import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

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
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 19,
  },
  STUDIO: {
    name: "Studio",
    mockupsPerMonth: Infinity,
    brandsLimit: Infinity,
    exportsPerMonth: Infinity,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID!,
    price: 49,
  },
} as const;

export async function createOrRetrieveCustomer(email: string, userId: string) {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0];

  return stripe.customers.create({
    email,
    metadata: { userId },
  });
}
