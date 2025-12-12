// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Create the Clerk middleware handler once
 * (same as you used before: clerkMiddleware()).
 */
const clerkHandler = clerkMiddleware();

/**
 * The new "proxy" entrypoint for Next.js.
 * We forward the NextRequest to Clerk's middleware handler.
 */
export default function proxy(request: NextRequest) {
  // clerkHandler expects a NextRequest-like object and returns a NextResponse.
  // Type-cast to any to avoid TS mismatch if needed.
  // Clerk returns a NextResponse or undefined — Next will handle it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return clerkHandler(request as any) as NextResponse | Response | undefined;
}

/**
 * Keep the same matcher config so Clerk runs for the same routes.
 */
export const config = {
  matcher: [
    // Skip Next.js internals and static files (same regex as before)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
