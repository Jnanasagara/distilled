/**
 * SYSTEM TESTS — Distilled
 * End-to-end HTTP tests against a running Next.js dev server (localhost:3000).
 * Requires the server to be running before executing these tests.
 *
 * Run with:  BASE_URL=http://localhost:3000 npx jest --testPathPattern=system
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

async function get(path: string, opts: RequestInit = {}) {
  return fetch(`${BASE_URL}${path}`, { redirect: "manual", ...opts });
}

async function post(path: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    redirect: "manual",
  });
}

// ---------------------------------------------------------------------------
// TC-S-01 to TC-S-05 : Page availability
// ---------------------------------------------------------------------------

describe("Page availability — System Tests", () => {
  test("TC-S-01: GET / returns 200 (landing page)", async () => {
    const res = await get("/");
    expect(res.status).toBe(200);
  });

  test("TC-S-02: GET /auth returns 200 (login page)", async () => {
    const res = await get("/auth");
    expect(res.status).toBe(200);
  });

  test("TC-S-03: GET /privacy returns 200 (privacy policy page)", async () => {
    const res = await get("/privacy");
    expect(res.status).toBe(200);
  });

  test("TC-S-04: GET /terms returns 200 (terms of service page)", async () => {
    const res = await get("/terms");
    expect(res.status).toBe(200);
  });

  test("TC-S-05: GET /nonexistent returns 404", async () => {
    const res = await get("/this-page-does-not-exist-12345");
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// TC-S-06 to TC-S-10 : Authentication redirect behaviour
// ---------------------------------------------------------------------------

describe("Authentication redirects — System Tests", () => {
  test("TC-S-06: unauthenticated GET /feed redirects (3xx)", async () => {
    const res = await get("/feed");
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
  });

  test("TC-S-07: unauthenticated GET /profile redirects (3xx)", async () => {
    const res = await get("/profile");
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
  });

  test("TC-S-08: unauthenticated GET /admin redirects (3xx)", async () => {
    const res = await get("/admin");
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
  });

  test("TC-S-09: /feed redirect points toward /auth", async () => {
    const res = await get("/feed");
    const location = res.headers.get("location") ?? "";
    expect(location).toMatch(/auth|signin|login/i);
  });

  test("TC-S-10: /onboarding redirects unauthenticated users", async () => {
    const res = await get("/onboarding");
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
  });
});

// ---------------------------------------------------------------------------
// TC-S-11 to TC-S-15 : Signup API end-to-end
// ---------------------------------------------------------------------------

describe("Signup API — System Tests", () => {
  test("TC-S-11: POST /api/auth/signup with missing body returns 4xx", async () => {
    const res = await post("/api/auth/signup", {});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  test("TC-S-12: POST /api/auth/signup with invalid email returns 400", async () => {
    const res = await post("/api/auth/signup", {
      name: "Test",
      email: "not-an-email",
      password: "SecurePass1",
    });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/valid email/i);
  });

  test("TC-S-13: POST /api/auth/signup with weak password returns 400", async () => {
    const res = await post("/api/auth/signup", {
      name: "Test",
      email: "test@example.com",
      password: "abc",
    });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  test("TC-S-14: POST /api/auth/signup response is JSON", async () => {
    const res = await post("/api/auth/signup", {
      name: "Test",
      email: "not-an-email",
      password: "SecurePass1",
    });
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
  });

  test("TC-S-15: OPTIONS /api/auth/signup does not return 5xx", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "OPTIONS",
      redirect: "manual",
    });
    expect(res.status).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// TC-S-16 to TC-S-20 : API security & error handling
// ---------------------------------------------------------------------------

describe("API security — System Tests", () => {
  test("TC-S-16: GET /api/preferences without auth returns 401", async () => {
    const res = await get("/api/preferences");
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
  });

  test("TC-S-17: POST /api/preferences without auth returns 401", async () => {
    const res = await post("/api/preferences", { topicIds: ["t1"], postCount: 20, frequency: "DAILY" });
    const body = await res.json();
    expect(res.status).toBe(401);
  });

  test("TC-S-18: GET /api/feed without auth returns 401", async () => {
    const res = await get("/api/feed");
    const body = await res.json();
    expect(res.status).toBe(401);
  });

  test("TC-S-19: GET /api/topics returns 200 with array of topics", async () => {
    const res = await get("/api/topics");
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test("TC-S-20: GET /api/announcements returns 200", async () => {
    const res = await get("/api/announcements");
    expect(res.status).toBe(200);
  });
});
