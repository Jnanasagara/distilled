/**
 * INTEGRATION TESTS — Distilled
 * Tests API route handler logic with mocked Prisma, Redis, bcrypt, and NextAuth.
 * No real database or network connections are made.
 */

// ---------------------------------------------------------------------------
// Mocks — must be declared before imports
// ---------------------------------------------------------------------------

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindMany = jest.fn();
const mockUpsert = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mockFindUnique, create: mockCreate, update: mockUpdate },
    verificationToken: { create: mockCreate },
    userPreference: { findUnique: mockFindUnique, upsert: mockUpsert },
    userTopic: { findMany: mockFindMany, create: mockCreate, update: mockUpdate },
    topic: { findMany: mockFindMany },
    article: { findMany: mockFindMany },
  },
}));

jest.mock("@/lib/redis", () => ({
  redis: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
}));

jest.mock("@/lib/email", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ limited: false }),
  getIp: jest.fn().mockReturnValue("127.0.0.1"),
  rateLimitedResponse: jest.fn(),
  parseJsonBody: jest.fn(),
  validateOrigin: jest.fn().mockReturnValue(true),
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock("dns", () => ({
  promises: {
    resolveMx: jest.fn().mockResolvedValue([{ exchange: "mail.example.com", priority: 10 }]),
  },
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { parseJsonBody, validateOrigin, rateLimit } from "@/lib/rate-limit";
import { redis } from "@/lib/redis";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: Record<string, unknown>, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function readJson(response: Response) {
  return response.json();
}

// ---------------------------------------------------------------------------
// TC-I-01 to TC-I-10 : Signup API (/api/auth/signup)
// ---------------------------------------------------------------------------

describe("Signup API — Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateOrigin as jest.Mock).mockReturnValue(true);
    (rateLimit as jest.Mock).mockResolvedValue({ limited: false });
  });

  test("TC-I-01: valid signup returns 200 with success message", async () => {
    (parseJsonBody as jest.Mock).mockResolvedValue({
      data: { name: "Alice", email: "alice@example.com", password: "SecurePass1" },
    });
    mockFindUnique.mockResolvedValue(null); // no existing user
    mockCreate.mockResolvedValue({});

    const { POST } = await import("../app/api/auth/signup/route");
    const res = await POST(makeRequest({}));
    const body = await readJson(res);

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/check your email/i);
  });

  test("TC-I-02: missing email returns 400", async () => {
    (parseJsonBody as jest.Mock).mockResolvedValue({
      data: { name: "Alice", email: "", password: "SecurePass1" },
    });

    const { POST } = await import("../app/api/auth/signup/route");
    const res = await POST(makeRequest({}));
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/email and password required/i);
  });

  test("TC-I-03: invalid email format returns 400", async () => {
    (parseJsonBody as jest.Mock).mockResolvedValue({
      data: { name: "Alice", email: "not-an-email", password: "SecurePass1" },
    });

    const { POST } = await import("../app/api/auth/signup/route");
    const res = await POST(makeRequest({}));
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/valid email/i);
  });

  test("TC-I-04: weak password (no uppercase) returns 400", async () => {
    (parseJsonBody as jest.Mock).mockResolvedValue({
      data: { name: "Alice", email: "alice@example.com", password: "weakpass1" },
    });

    const { POST } = await import("../app/api/auth/signup/route");
    const res = await POST(makeRequest({}));
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/uppercase/i);
  });

  test("TC-I-05: short password returns 400", async () => {
    (parseJsonBody as jest.Mock).mockResolvedValue({
      data: { name: "Alice", email: "alice@example.com", password: "Ab1" },
    });

    const { POST } = await import("../app/api/auth/signup/route");
    const res = await POST(makeRequest({}));
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/8 characters/i);
  });

  test("TC-I-06: duplicate email returns 400", async () => {
    (parseJsonBody as jest.Mock).mockResolvedValue({
      data: { name: "Alice", email: "alice@example.com", password: "SecurePass1" },
    });
    mockFindUnique.mockResolvedValue({ id: "existing-user" });

    const { POST } = await import("../app/api/auth/signup/route");
    const res = await POST(makeRequest({}));
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/already exists/i);
  });

  test("TC-I-07: rate-limited request returns 429", async () => {
    (rateLimit as jest.Mock).mockResolvedValue({ limited: true });
    const mockRateLimitedResponse = jest.fn().mockReturnValue(
      NextResponse.json({ error: "Too many requests" }, { status: 429 })
    );
    const { rateLimitedResponse } = await import("@/lib/rate-limit");
    (rateLimitedResponse as jest.Mock).mockImplementation(mockRateLimitedResponse);

    (parseJsonBody as jest.Mock).mockResolvedValue({
      data: { name: "Alice", email: "alice@example.com", password: "SecurePass1" },
    });

    const { POST } = await import("../app/api/auth/signup/route");
    const res = await POST(makeRequest({}));

    expect(res.status).toBe(429);
  });

  test("TC-I-08: origin validation failure returns 403", async () => {
    (validateOrigin as jest.Mock).mockReturnValue(false);

    const { POST } = await import("../app/api/auth/signup/route");
    const res = await POST(makeRequest({}));
    const body = await readJson(res);

    expect(res.status).toBe(403);
    expect(body.error).toBe("Forbidden");
  });

  test("TC-I-09: parseJsonBody error is propagated", async () => {
    (parseJsonBody as jest.Mock).mockResolvedValue({
      error: NextResponse.json({ error: "Request body too large" }, { status: 413 }),
    });

    const { POST } = await import("../app/api/auth/signup/route");
    const res = await POST(makeRequest({}));

    expect(res.status).toBe(413);
  });

  test("TC-I-10: successful signup creates user and verification token", async () => {
    (parseJsonBody as jest.Mock).mockResolvedValue({
      data: { name: "Bob", email: "bob@example.com", password: "SecurePass1" },
    });
    mockFindUnique.mockResolvedValue(null);
    const createMock = jest.fn().mockResolvedValue({});
    mockCreate.mockImplementation(createMock);

    const { POST } = await import("../app/api/auth/signup/route");
    await POST(makeRequest({}));

    // prisma.user.create and prisma.verificationToken.create should both be called
    expect(createMock).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// TC-I-11 to TC-I-20 : Preferences API (/api/preferences)
// ---------------------------------------------------------------------------

describe("Preferences API — Integration Tests", () => {
  const mockGetServerSession = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const nextAuth = await import("next-auth");
    (nextAuth.getServerSession as jest.Mock).mockImplementation(mockGetServerSession);
  });

  test("TC-I-11: unauthenticated GET returns 401", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("../app/api/preferences/route");
    const res = await GET();
    const body = await readJson(res);

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
  });

  test("TC-I-12: authenticated GET returns preferences and topics", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ postCount: 20, frequency: "DAILY", hideInterestPrompt: false, showTrending: true });
    mockFindMany.mockResolvedValue([
      { topic: { id: "t1", slug: "ai", name: "AI", emoji: "🤖" }, weight: 1.0, status: "ACTIVE" },
    ]);

    const { GET } = await import("../app/api/preferences/route");
    const res = await GET();
    const body = await readJson(res);

    expect(res.status).toBe(200);
    expect(body).toHaveProperty("preferences");
    expect(body).toHaveProperty("topics");
    expect(Array.isArray(body.topics)).toBe(true);
  });

  test("TC-I-13: GET returns defaults when no preferences row exists", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(null);
    mockFindMany.mockResolvedValue([]);

    const { GET } = await import("../app/api/preferences/route");
    const res = await GET();
    const body = await readJson(res);

    expect(res.status).toBe(200);
    expect(body.preferences.postCount).toBe(20);
    expect(body.preferences.frequency).toBe("DAILY");
  });

  test("TC-I-14: unauthenticated POST returns 401", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = makeRequest({ topicIds: ["t1"], postCount: 20, frequency: "DAILY" });
    const { POST } = await import("../app/api/preferences/route");
    const res = await POST(req);
    const body = await readJson(res);

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
  });

  test("TC-I-15: POST with empty topicIds returns 400", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });

    const req = makeRequest({ topicIds: [], postCount: 20, frequency: "DAILY" });
    const { POST } = await import("../app/api/preferences/route");
    const res = await POST(req);
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/at least one topic/i);
  });

  test("TC-I-16: POST with more than 50 topics returns 400", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });

    const topicIds = Array.from({ length: 51 }, (_, i) => `topic-${i}`);
    const req = makeRequest({ topicIds, postCount: 20, frequency: "DAILY" });
    const { POST } = await import("../app/api/preferences/route");
    const res = await POST(req);
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/too many topics/i);
  });

  test("TC-I-17: POST with invalid frequency returns 400", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([{ id: "t1" }]); // valid topics

    const req = makeRequest({ topicIds: ["t1"], postCount: 20, frequency: "HOURLY" });
    const { POST } = await import("../app/api/preferences/route");
    const res = await POST(req);
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/invalid frequency/i);
  });

  test("TC-I-18: POST with postCount above max for DAILY returns 400", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([{ id: "t1" }]);

    const req = makeRequest({ topicIds: ["t1"], postCount: 999, frequency: "DAILY" });
    const { POST } = await import("../app/api/preferences/route");
    const res = await POST(req);
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/post count/i);
  });

  test("TC-I-19: POST with non-string topicId returns 400", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });

    const req = makeRequest({ topicIds: [123], postCount: 20, frequency: "DAILY" });
    const { POST } = await import("../app/api/preferences/route");
    const res = await POST(req);
    const body = await readJson(res);

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/invalid topic ids/i);
  });

  test("TC-I-20: valid POST saves preferences and invalidates feed cache", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany
      .mockResolvedValueOnce([{ id: "t1" }]) // topic validation
      .mockResolvedValueOnce([]); // existing user topics
    mockUpsert.mockResolvedValue({});
    mockUpdate.mockResolvedValue({});
    (redis.del as jest.Mock).mockResolvedValue(1);

    const req = makeRequest({ topicIds: ["t1"], postCount: 20, frequency: "DAILY" });
    const { POST } = await import("../app/api/preferences/route");
    const res = await POST(req);
    const body = await readJson(res);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(redis.del).toHaveBeenCalledWith("feed:user-1");
  });
});
