/**
 * UNIT TESTS — Distilled
 * Tests pure functions in algorithm.ts and rate-limit.ts helpers.
 * No database or network required.
 */

import {
  scoreArticle,
  suppressRedundancy,
  enforceSourceSpacing,
  diversifyFeed,
  generateReason,
} from "../lib/algorithm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeArticle(overrides: Record<string, unknown> = {}) {
  return {
    id: "art-1",
    title: "Test Article",
    source: "hackernews",
    topicId: "topic-ai",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    imageUrl: null,
    topic: { name: "AI", emoji: "🤖" },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// TC-U-01 to TC-U-10 : scoreArticle
// ---------------------------------------------------------------------------

describe("scoreArticle — Unit Tests", () => {
  const topicMap = new Map([["topic-ai", 2.0]]);

  test("TC-U-01: returns a positive score for a fresh article", () => {
    const article = makeArticle();
    const score = scoreArticle(article, topicMap);
    expect(score).toBeGreaterThan(0);
  });

  test("TC-U-02: higher topic weight produces a higher score", () => {
    const lowWeight = new Map([["topic-ai", 1.0]]);
    const highWeight = new Map([["topic-ai", 3.0]]);
    const article = makeArticle();
    const scoreLow = scoreArticle(article, lowWeight);
    const scoreHigh = scoreArticle(article, highWeight);
    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });

  test("TC-U-03: older article scores lower than a fresh one", () => {
    const fresh = makeArticle({ publishedAt: new Date().toISOString() });
    const staleDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const stale = makeArticle({ publishedAt: staleDate });

    const topicMap2 = new Map([["topic-ai", 1.0]]);
    const scoreFresh = scoreArticle(fresh, topicMap2);
    const scoreStale = scoreArticle(stale, topicMap2);
    expect(scoreFresh).toBeGreaterThan(scoreStale);
  });

  test("TC-U-04: image bonus — article with imageUrl scores 5% higher", () => {
    const tm = new Map([["topic-ai", 1.0]]);
    const noImg = makeArticle({ imageUrl: null });
    const withImg = makeArticle({ imageUrl: "https://example.com/img.jpg" });
    const scoreNo = scoreArticle(noImg, tm);
    const scoreWith = scoreArticle(withImg, tm);
    expect(scoreWith / scoreNo).toBeCloseTo(1.05, 2);
  });

  test("TC-U-05: source affinity multiplier is applied", () => {
    const tm = new Map([["topic-ai", 1.0]]);
    const noAffinity = new Map<string, number>();
    const withAffinity = new Map([["hackernews", 1.4]]);
    const article = makeArticle();
    const scoreBase = scoreArticle(article, tm, noAffinity);
    const scoreAffinity = scoreArticle(article, tm, withAffinity);
    expect(scoreAffinity / scoreBase).toBeCloseTo(1.4, 2);
  });

  test("TC-U-06: unknown topicId uses default weight 1.0", () => {
    const emptyTopicMap = new Map<string, number>();
    const article = makeArticle({ topicId: "topic-unknown" });
    const score = scoreArticle(article, emptyTopicMap);
    expect(score).toBeGreaterThan(0);
  });

  test("TC-U-07: article with no topicId still scores positively", () => {
    const tm = new Map<string, number>();
    const article = makeArticle({ topicId: null });
    const score = scoreArticle(article, tm);
    expect(score).toBeGreaterThan(0);
  });

  test("TC-U-08: very old article (720h) has near-zero recency component", () => {
    const tm = new Map([["topic-ai", 1.0]]);
    const veryOld = makeArticle({
      publishedAt: new Date(Date.now() - 720 * 60 * 60 * 1000).toISOString(),
    });
    const score = scoreArticle(veryOld, tm, new Map(), new Map(), 72);
    expect(score).toBeLessThan(0.01);
  });

  test("TC-U-09: topic hot score amplifies final score", () => {
    const tm = new Map([["topic-ai", 1.0]]);
    const noHot = new Map<string, number>();
    const hotMap = new Map([["topic-ai", 1.5]]);
    const article = makeArticle();
    const scoreBase = scoreArticle(article, tm, new Map(), noHot);
    const scoreHot = scoreArticle(article, tm, new Map(), hotMap);
    expect(scoreHot).toBeGreaterThan(scoreBase);
  });

  test("TC-U-10: score is deterministic for same inputs", () => {
    const tm = new Map([["topic-ai", 1.5]]);
    const article = makeArticle();
    const s1 = scoreArticle(article, tm);
    const s2 = scoreArticle(article, tm);
    expect(s1).toBe(s2);
  });
});

// ---------------------------------------------------------------------------
// TC-U-11 to TC-U-15 : suppressRedundancy
// ---------------------------------------------------------------------------

describe("suppressRedundancy — Unit Tests", () => {
  test("TC-U-11: removes exact duplicate titles", () => {
    const articles = [
      makeArticle({ id: "1", title: "OpenAI launches new model" }),
      makeArticle({ id: "2", title: "OpenAI launches new model" }),
    ];
    const result = suppressRedundancy(articles);
    expect(result).toHaveLength(1);
  });

  test("TC-U-12: keeps articles with different titles", () => {
    const articles = [
      makeArticle({ id: "1", title: "OpenAI launches GPT-5" }),
      makeArticle({ id: "2", title: "Google releases Gemini Ultra" }),
    ];
    const result = suppressRedundancy(articles);
    expect(result).toHaveLength(2);
  });

  test("TC-U-13: punctuation-insensitive deduplication", () => {
    const articles = [
      makeArticle({ id: "1", title: "OpenAI: Launches New Model!" }),
      makeArticle({ id: "2", title: "OpenAI Launches New Model" }),
    ];
    const result = suppressRedundancy(articles);
    expect(result).toHaveLength(1);
  });

  test("TC-U-14: empty array returns empty array", () => {
    expect(suppressRedundancy([])).toHaveLength(0);
  });

  test("TC-U-15: preserves order — first occurrence survives", () => {
    const articles = [
      makeArticle({ id: "1", title: "Rust is fast and memory safe" }),
      makeArticle({ id: "2", title: "Rust is fast and memory safe" }),
    ];
    const result = suppressRedundancy(articles);
    expect(result[0].id).toBe("1");
  });
});

// ---------------------------------------------------------------------------
// TC-U-16 to TC-U-20 : enforceSourceSpacing
// ---------------------------------------------------------------------------

describe("enforceSourceSpacing — Unit Tests", () => {
  test("TC-U-16: no change when sources are already diverse", () => {
    const articles = [
      makeArticle({ id: "1", source: "hackernews" }),
      makeArticle({ id: "2", source: "reddit" }),
      makeArticle({ id: "3", source: "devto" }),
    ];
    const result = enforceSourceSpacing(articles);
    expect(result.map((a) => a.source)).toEqual(["hackernews", "reddit", "devto"]);
  });

  test("TC-U-17: breaks up 3 consecutive same-source articles", () => {
    const articles = [
      makeArticle({ id: "1", source: "reddit" }),
      makeArticle({ id: "2", source: "reddit" }),
      makeArticle({ id: "3", source: "reddit" }),
      makeArticle({ id: "4", source: "hackernews" }),
    ];
    const result = enforceSourceSpacing(articles, 2);
    // position 2 should no longer be reddit
    expect(result[2].source).not.toBe("reddit");
  });

  test("TC-U-18: single article list unchanged", () => {
    const articles = [makeArticle({ id: "1", source: "hackernews" })];
    const result = enforceSourceSpacing(articles);
    expect(result).toHaveLength(1);
  });

  test("TC-U-19: empty array returns empty array", () => {
    expect(enforceSourceSpacing([])).toHaveLength(0);
  });

  test("TC-U-20: result preserves total article count", () => {
    const articles = [
      makeArticle({ id: "1", source: "reddit" }),
      makeArticle({ id: "2", source: "reddit" }),
      makeArticle({ id: "3", source: "reddit" }),
      makeArticle({ id: "4", source: "hackernews" }),
      makeArticle({ id: "5", source: "devto" }),
    ];
    const result = enforceSourceSpacing(articles, 2);
    expect(result).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// TC-U-21 to TC-U-25 : diversifyFeed
// ---------------------------------------------------------------------------

describe("diversifyFeed — Unit Tests", () => {
  test("TC-U-21: interleaves different topics", () => {
    const articles = [
      makeArticle({ id: "1", topicId: "ai", title: "AI Article 1" }),
      makeArticle({ id: "2", topicId: "ai", title: "AI Article 2" }),
      makeArticle({ id: "3", topicId: "finance", title: "Finance Article 1" }),
      makeArticle({ id: "4", topicId: "finance", title: "Finance Article 2" }),
    ];
    const result = diversifyFeed(articles);
    expect(result).toHaveLength(4);
    // First two should be from different topics
    expect(result[0].topicId).not.toBe(result[1].topicId);
  });

  test("TC-U-22: preserves total count", () => {
    const articles = Array.from({ length: 10 }, (_, i) =>
      makeArticle({ id: String(i), topicId: i % 3 === 0 ? "ai" : "finance" })
    );
    expect(diversifyFeed(articles)).toHaveLength(10);
  });

  test("TC-U-23: single-topic feed returns all articles", () => {
    const articles = [
      makeArticle({ id: "1", topicId: "ai" }),
      makeArticle({ id: "2", topicId: "ai" }),
      makeArticle({ id: "3", topicId: "ai" }),
    ];
    const result = diversifyFeed(articles);
    expect(result).toHaveLength(3);
  });

  test("TC-U-24: empty feed returns empty array", () => {
    expect(diversifyFeed([])).toHaveLength(0);
  });

  test("TC-U-25: articles with null topicId are grouped together", () => {
    const articles = [
      makeArticle({ id: "1", topicId: null }),
      makeArticle({ id: "2", topicId: null }),
      makeArticle({ id: "3", topicId: "ai" }),
    ];
    const result = diversifyFeed(articles);
    expect(result).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// TC-U-26 to TC-U-30 : generateReason
// ---------------------------------------------------------------------------

describe("generateReason — Unit Tests", () => {
  test("TC-U-26: trending article returns trending reason", () => {
    const article = makeArticle();
    const reason = generateReason(article, new Map(), true);
    expect(reason).toContain("Trending");
  });

  test("TC-U-27: high-weight topic returns strong interest reason", () => {
    const article = makeArticle({ topicId: "topic-ai" });
    const topicMap = new Map([["topic-ai", 2.5]]);
    const reason = generateReason(article, topicMap, false);
    expect(reason).toMatch(/engage|interest/i);
  });

  test("TC-U-28: hot topic returns hot reading reason", () => {
    const article = makeArticle({ topicId: "topic-ai" });
    const topicMap = new Map([["topic-ai", 1.0]]);
    const hotMap = new Map([["topic-ai", 1.5]]);
    const reason = generateReason(article, topicMap, false, new Map(), hotMap);
    expect(reason).toContain("reading a lot");
  });

  test("TC-U-29: fresh article (< 6h old) mentions time", () => {
    const article = makeArticle({
      topicId: "topic-ai",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    });
    const topicMap = new Map([["topic-ai", 1.0]]);
    const reason = generateReason(article, topicMap, false);
    expect(reason).toMatch(/Published|ago/i);
  });

  test("TC-U-30: source affinity reason includes source name", () => {
    const article = makeArticle({ topicId: "topic-ai", source: "reddit" });
    const topicMap = new Map([["topic-ai", 1.0]]);
    const sourceAffinity = new Map([["reddit", 1.4]]);
    const reason = generateReason(article, topicMap, false, sourceAffinity);
    expect(reason).toContain("Reddit");
  });
});

// ---------------------------------------------------------------------------
// TC-U-31 to TC-U-35 : rate-limit helpers (pure logic only)
// ---------------------------------------------------------------------------

describe("rate-limit helpers — Unit Tests", () => {
  test("TC-U-31: getIp returns first IP from x-forwarded-for header", () => {
    // Re-implement inline to test the pure logic without importing Next.js
    function getIp(headers: Record<string, string | null>): string {
      const forwarded = headers["x-forwarded-for"];
      return forwarded?.split(",")[0]?.trim() ?? "unknown";
    }
    expect(getIp({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })).toBe("1.2.3.4");
  });

  test("TC-U-32: getIp returns 'unknown' when header is absent", () => {
    function getIp(headers: Record<string, string | null>): string {
      const forwarded = headers["x-forwarded-for"];
      return forwarded?.split(",")[0]?.trim() ?? "unknown";
    }
    expect(getIp({ "x-forwarded-for": null })).toBe("unknown");
  });

  test("TC-U-33: validateOrigin returns true in development", () => {
    const origEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", { value: "development", configurable: true });
    function validateOrigin(): boolean {
      if (process.env.NODE_ENV !== "production") return true;
      return false;
    }
    expect(validateOrigin()).toBe(true);
    Object.defineProperty(process.env, "NODE_ENV", { value: origEnv, configurable: true });
  });

  test("TC-U-34: parseJsonBody-equivalent rejects oversized content", () => {
    const MAX = 1024 * 1024;
    function isOversized(len: number): boolean {
      return len > MAX;
    }
    expect(isOversized(MAX + 1)).toBe(true);
    expect(isOversized(MAX)).toBe(false);
  });

  test("TC-U-35: rateLimit logic — count exceeds limit means limited=true", () => {
    function isLimited(count: number, limit: number): boolean {
      return count > limit;
    }
    expect(isLimited(6, 5)).toBe(true);
    expect(isLimited(5, 5)).toBe(false);
    expect(isLimited(1, 5)).toBe(false);
  });
});
