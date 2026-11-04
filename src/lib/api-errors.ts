import "server-only";
import { Prisma } from "@/generated/prisma/client";
export function apiError(error: unknown) {
  if (error instanceof SyntaxError)
    return Response.json(
      { error: "The request could not be read. Please try again." },
      { status: 400 },
    );
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  )
    return Response.json(
      { error: "This application no longer exists. Refresh your workspace." },
      { status: 404 },
    );
  console.error(
    "Application database operation failed",
    error instanceof Error ? error.name : "Unknown error",
  );
  return Response.json(
    {
      error:
        "We couldn’t save or load your applications. Please try again. If this continues, check the local database setup.",
    },
    { status: 500 },
  );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  // Next may normalize request.url to localhost even when the browser uses
  // 127.0.0.1. Host is the incoming authority; browsers cannot spoof it in fetch.
  const expected = new URL(request.url);
  const host = request.headers.get("host");
  if (host) expected.host = host;
  return origin === expected.origin;
}
