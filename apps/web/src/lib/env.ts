/**
 * Environment-derived feature flags.
 *
 * ThreadForge can run in two modes:
 *
 *  1. **Connected** — Postgres, Clerk, Cloudinary and Stripe are configured and
 *     every request is authenticated and persisted for real.
 *  2. **Demo** — no credentials required. The app serves an in-memory sample
 *     workspace so the UI, editor and export flow can be explored locally.
 *
 * Demo mode is switched on explicitly with `NEXT_PUBLIC_DEMO_MODE=1`, or
 * implicitly when a Clerk publishable key is missing. Because only
 * `NEXT_PUBLIC_*` variables are read here, the flag resolves identically on the
 * server and in the browser.
 */

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** True when a database connection string is configured. */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

/** True when Cloudinary upload credentials are configured. */
export const hasCloudinary = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET
);

/** True when Stripe can create checkout sessions. */
export const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);

export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
