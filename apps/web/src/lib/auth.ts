import { isDemoMode } from "./env";
import { DEMO_USER } from "./demo-data";

/**
 * The authenticated user, resolved from Clerk in connected mode or from the
 * sample workspace in demo mode. Prisma and Clerk are imported lazily so demo
 * mode never touches the database.
 */
export async function getCurrentUser() {
  if (isDemoMode) return DEMO_USER;

  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return null;

  const { db } = await import("./db");
  const existing = await db.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  // The Clerk webhook normally creates this row; this keeps local
  // development working when the webhook isn't wired up yet.
  const profile = await currentUser();
  const email =
    profile?.emailAddresses.find((address) => address.id === profile.primaryEmailAddressId)
      ?.emailAddress ??
    profile?.emailAddresses[0]?.emailAddress ??
    `${userId}@users.noreply.threadforge.io`;

  return db.user.create({
    data: {
      clerkId: userId,
      email,
      name: [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || null,
      avatarUrl: profile?.imageUrl ?? null,
    },
  });
}

/** Returns the current user or `null`, for route handlers that must return 401. */
export async function requireUser() {
  return getCurrentUser();
}
