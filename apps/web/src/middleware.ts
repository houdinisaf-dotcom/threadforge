import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { isDemoMode } from "@/lib/env";

/**
 * In connected mode Clerk protects the dashboard and exposes `auth()` to
 * server components. In demo mode every route is public so the app can be
 * explored without credentials.
 */
type Middleware = (request: NextRequest, event: NextFetchEvent) => Promise<unknown> | unknown;

let connectedMiddleware: Middleware | null = null;

async function getConnectedMiddleware(): Promise<Middleware> {
  if (connectedMiddleware) return connectedMiddleware;

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

  connectedMiddleware = clerkMiddleware((auth, request) => {
    if (isProtectedRoute(request)) {
      // Throws a redirect to sign-in when the visitor isn't authenticated.
      auth().protect();
    }
  });

  return connectedMiddleware;
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isDemoMode) return NextResponse.next();

  const handler = await getConnectedMiddleware();
  return handler(request, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
