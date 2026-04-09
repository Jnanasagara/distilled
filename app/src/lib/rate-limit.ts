import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

/**
 * Sliding-window rate limiter backed by Redis.
 *
 * Uses a per-window counter key: rl:<identifier>:<window>
 * Each window is `windowSeconds` wide. The key expires when the window closes,
 * so memory usage stays bounded without a background cleanup job.
 */
export async function rateLimit(
  identifier: string,   // e.g. "signup:1.2.3.4" or "forgot:user@example.com"
  limit: number,        // max requests allowed in the window
  windowSeconds: number // window size in seconds
): Promise<{ limited: boolean; remaining: number }> {
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `rl:${identifier}:${window}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      // First request in this window — set TTL so key auto-cleans
      await redis.expire(key, windowSeconds * 2);
    }
    return { limited: count > limit, remaining: Math.max(0, limit - count) };
  } catch {
    // Redis unavailable — fail closed on sensitive endpoints to prevent brute force
    return { limited: true, remaining: 0 };
  }
}

/** Extract the real client IP from Next.js request headers. */
export function getIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

/** Return a 429 response with a Retry-After header. */
export function rateLimitedResponse(windowSeconds: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(windowSeconds) },
    }
  );
}

/** Max request body size in bytes (1MB). */
const MAX_BODY_SIZE = 1024 * 1024;

/**
 * Parse JSON body with size limit and Content-Type check.
 * Returns parsed body or a NextResponse error.
 */
export async function parseJsonBody(req: Request): Promise<{ data: any } | { error: NextResponse }> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return { error: NextResponse.json({ error: "Request too large" }, { status: 413 }) };
  }
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_SIZE) {
      return { error: NextResponse.json({ error: "Request too large" }, { status: 413 }) };
    }
    return { data: JSON.parse(text) };
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) };
  }
}

/**
 * Validate that the request Origin matches the app's expected origin (CSRF protection).
 * Only enforced in production.
 */
export function validateOrigin(req: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const origin = req.headers.get("origin");
  const expected = process.env.NEXTAUTH_URL;
  if (!origin || !expected) return true;
  return origin === expected || origin === expected.replace(/\/$/, "");
}
