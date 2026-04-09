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
    // Redis unavailable — fail open (don't block the request)
    return { limited: false, remaining: limit };
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
