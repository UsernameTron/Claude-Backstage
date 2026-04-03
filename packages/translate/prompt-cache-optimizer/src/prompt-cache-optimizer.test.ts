import { describe, test, expect } from "bun:test";
import {
  optimizeCacheOrder,
  isStableSegment,
  estimateCacheSavings,
  CacheScope,
  type CacheSegment,
} from "./index";

function makeSegment(overrides: Partial<CacheSegment> = {}): CacheSegment {
  return {
    content: "test",
    scope: CacheScope.None,
    stable: false,
    ...overrides,
  };
}

describe("isStableSegment", () => {
  test("returns true for stable segment with None scope", () => {
    expect(isStableSegment(makeSegment({ stable: true, scope: CacheScope.None }))).toBe(true);
  });

  test("returns true for unstable segment with Global scope", () => {
    expect(isStableSegment(makeSegment({ stable: false, scope: CacheScope.Global }))).toBe(true);
  });

  test("returns true for unstable segment with Org scope", () => {
    expect(isStableSegment(makeSegment({ stable: false, scope: CacheScope.Org }))).toBe(true);
  });

  test("returns false for unstable segment with None scope", () => {
    expect(isStableSegment(makeSegment({ stable: false, scope: CacheScope.None }))).toBe(false);
  });
});

describe("estimateCacheSavings", () => {
  test("returns ratio of stable to total tokens", () => {
    expect(estimateCacheSavings(1000, 700)).toBeCloseTo(0.7);
  });

  test("returns 0 when totalTokens is 0", () => {
    expect(estimateCacheSavings(0, 0)).toBe(0);
  });

  test("returns 1.0 when all tokens are stable", () => {
    expect(estimateCacheSavings(100, 100)).toBeCloseTo(1.0);
  });

  test("returns 0 when no tokens are stable", () => {
    expect(estimateCacheSavings(100, 0)).toBe(0);
  });
});

describe("optimizeCacheOrder", () => {
  test("sorts Global segments before Org before None", () => {
    const segments = [
      makeSegment({ content: "none", scope: CacheScope.None, stable: true }),
      makeSegment({ content: "global", scope: CacheScope.Global, stable: true }),
      makeSegment({ content: "org", scope: CacheScope.Org, stable: true }),
    ];
    const result = optimizeCacheOrder(segments);
    expect(result.segments[0].content).toBe("global");
    expect(result.segments[1].content).toBe("org");
    expect(result.segments[2].content).toBe("none");
  });

  test("sorts stable before unstable within same scope", () => {
    const segments = [
      makeSegment({ content: "unstable", scope: CacheScope.Global, stable: false }),
      makeSegment({ content: "stable", scope: CacheScope.Global, stable: true }),
    ];
    const result = optimizeCacheOrder(segments);
    expect(result.segments[0].content).toBe("stable");
    expect(result.segments[1].content).toBe("unstable");
  });

  test("returns correct boundaryPosition", () => {
    const segments = [
      makeSegment({ content: "g1", scope: CacheScope.Global, stable: true }),
      makeSegment({ content: "o1", scope: CacheScope.Org, stable: false }),
      makeSegment({ content: "n1", scope: CacheScope.None, stable: false }),
    ];
    const result = optimizeCacheOrder(segments);
    // Global stable + Org unstable (Org scope makes it "stable" per isStableSegment)
    expect(result.boundaryPosition).toBe(2);
  });

  test("returns estimatedCacheHitRate as ratio of stable content length to total", () => {
    const segments = [
      makeSegment({ content: "aaa", scope: CacheScope.Global, stable: true }),
      makeSegment({ content: "bb", scope: CacheScope.None, stable: false }),
    ];
    const result = optimizeCacheOrder(segments);
    // stable content: "aaa" (3 chars), total: "aaa" + "bb" (5 chars) => 3/5 = 0.6
    expect(result.estimatedCacheHitRate).toBeCloseTo(0.6);
  });

  test("returns empty result for empty array", () => {
    const result = optimizeCacheOrder([]);
    expect(result.segments).toEqual([]);
    expect(result.estimatedCacheHitRate).toBe(0);
    expect(result.boundaryPosition).toBe(0);
  });
});
