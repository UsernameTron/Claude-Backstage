import { describe, test, expect, beforeEach } from "bun:test";
import {
  addToTotalSessionCost,
  getStoredSessionCosts,
  formatTotalCost,
  saveCurrentSessionCosts,
  type SessionCostEntry,
  type SessionCosts,
} from "./index";

/**
 * Helper to reset module-level state between tests.
 * We call saveCurrentSessionCosts with empty data to clear state.
 */
function resetCostState(): void {
  saveCurrentSessionCosts({ entries: [], totalCostUSD: 0 });
}

function makeEntry(overrides: Partial<SessionCostEntry> = {}): SessionCostEntry {
  return {
    model: "claude-sonnet",
    inputTokens: 100,
    outputTokens: 50,
    cacheReadInputTokens: 10,
    cacheCreationInputTokens: 5,
    webSearchRequests: 0,
    costUSD: 0.01,
    ...overrides,
  };
}

describe("cost-tracker", () => {
  beforeEach(() => {
    resetCostState();
  });

  describe("addToTotalSessionCost", () => {
    test("adds a new entry for a new model", () => {
      addToTotalSessionCost(makeEntry());
      const costs = getStoredSessionCosts();
      expect(costs.entries).toHaveLength(1);
      expect(costs.entries[0].model).toBe("claude-sonnet");
      expect(costs.entries[0].inputTokens).toBe(100);
    });

    test("accumulates tokens for same model", () => {
      addToTotalSessionCost(makeEntry({ inputTokens: 100, costUSD: 0.01 }));
      addToTotalSessionCost(makeEntry({ inputTokens: 200, costUSD: 0.02 }));
      const costs = getStoredSessionCosts();
      expect(costs.entries).toHaveLength(1);
      expect(costs.entries[0].inputTokens).toBe(300);
      expect(costs.entries[0].costUSD).toBeCloseTo(0.03);
    });

    test("creates separate entries for different models", () => {
      addToTotalSessionCost(makeEntry({ model: "claude-sonnet" }));
      addToTotalSessionCost(makeEntry({ model: "claude-opus" }));
      const costs = getStoredSessionCosts();
      expect(costs.entries).toHaveLength(2);
    });

    test("accumulates all numeric fields", () => {
      const entry1 = makeEntry({
        inputTokens: 100,
        outputTokens: 50,
        cacheReadInputTokens: 10,
        cacheCreationInputTokens: 5,
        webSearchRequests: 1,
        costUSD: 0.01,
      });
      const entry2 = makeEntry({
        inputTokens: 200,
        outputTokens: 100,
        cacheReadInputTokens: 20,
        cacheCreationInputTokens: 10,
        webSearchRequests: 2,
        costUSD: 0.02,
      });
      addToTotalSessionCost(entry1);
      addToTotalSessionCost(entry2);
      const result = getStoredSessionCosts().entries[0];
      expect(result.inputTokens).toBe(300);
      expect(result.outputTokens).toBe(150);
      expect(result.cacheReadInputTokens).toBe(30);
      expect(result.cacheCreationInputTokens).toBe(15);
      expect(result.webSearchRequests).toBe(3);
      expect(result.costUSD).toBeCloseTo(0.03);
    });
  });

  describe("getStoredSessionCosts", () => {
    test("returns empty state when no costs recorded", () => {
      const costs = getStoredSessionCosts();
      expect(costs.entries).toHaveLength(0);
      expect(costs.totalCostUSD).toBe(0);
    });

    test("totalCostUSD sums across all models", () => {
      addToTotalSessionCost(makeEntry({ model: "claude-sonnet", costUSD: 0.50 }));
      addToTotalSessionCost(makeEntry({ model: "claude-opus", costUSD: 1.25 }));
      const costs = getStoredSessionCosts();
      expect(costs.totalCostUSD).toBeCloseTo(1.75);
    });
  });

  describe("formatTotalCost", () => {
    test("formats zero as $0.00", () => {
      expect(formatTotalCost(0)).toBe("$0.00");
    });

    test("formats 1.5 as $1.50", () => {
      expect(formatTotalCost(1.5)).toBe("$1.50");
    });

    test("formats 0.001 as $0.00 (2 decimal places)", () => {
      expect(formatTotalCost(0.001)).toBe("$0.00");
    });

    test("formats 12.345 as $12.35", () => {
      expect(formatTotalCost(12.345)).toBe("$12.35");
    });

    test("formats 100 as $100.00", () => {
      expect(formatTotalCost(100)).toBe("$100.00");
    });
  });

  describe("saveCurrentSessionCosts", () => {
    test("overwrites internal state", () => {
      addToTotalSessionCost(makeEntry({ model: "old-model", costUSD: 1.0 }));
      saveCurrentSessionCosts({
        entries: [makeEntry({ model: "new-model", costUSD: 2.0 })],
        totalCostUSD: 2.0,
      });
      const costs = getStoredSessionCosts();
      expect(costs.entries).toHaveLength(1);
      expect(costs.entries[0].model).toBe("new-model");
    });
  });
});
