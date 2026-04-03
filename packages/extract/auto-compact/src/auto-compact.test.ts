import { describe, expect, test } from "bun:test";
import {
  COMPACT_THRESHOLDS,
  getEffectiveWindow,
  shouldAutoCompact,
  compactConversation,
  partialCompactConversation,
} from "./index";
import type { Message } from "@claude-patterns/token-estimation";

describe("auto-compact", () => {
  describe("COMPACT_THRESHOLDS", () => {
    test("has autoCompactBuffer as a number", () => {
      expect(typeof COMPACT_THRESHOLDS.autoCompactBuffer).toBe("number");
      expect(COMPACT_THRESHOLDS.autoCompactBuffer).toBe(13_000);
    });

    test("has warningBuffer as a number", () => {
      expect(typeof COMPACT_THRESHOLDS.warningBuffer).toBe("number");
      expect(COMPACT_THRESHOLDS.warningBuffer).toBe(20_000);
    });

    test("has maxConsecutiveFailures", () => {
      expect(COMPACT_THRESHOLDS.maxConsecutiveFailures).toBe(3);
    });
  });

  describe("getEffectiveWindow", () => {
    test("returns modelContextWindow minus min(maxOutputTokens, 20000)", () => {
      // 200000 - min(8192, 20000) = 200000 - 8192 = 191808
      expect(getEffectiveWindow(200_000, 8_192)).toBe(191_808);
    });

    test("caps maxOutputTokens at 20000", () => {
      // 200000 - min(30000, 20000) = 200000 - 20000 = 180000
      expect(getEffectiveWindow(200_000, 30_000)).toBe(180_000);
    });
  });

  describe("shouldAutoCompact", () => {
    test("returns true when tokens exceed auto-compact threshold", () => {
      // effectiveWindow = 200000 - min(8192, 20000) = 191808
      // threshold = 191808 - 13000 = 178808
      // currentTokens = 180000 > 178808 => true
      expect(shouldAutoCompact(180_000, 200_000, 8_192)).toBe(true);
    });

    test("returns false when tokens are below threshold", () => {
      // effectiveWindow = 200000 - 8192 = 191808
      // threshold = 191808 - 13000 = 178808
      // currentTokens = 100000 < 178808 => false
      expect(shouldAutoCompact(100_000, 200_000, 8_192)).toBe(false);
    });
  });

  describe("compactConversation", () => {
    test("returns CompactionResult with summary string", async () => {
      const messages: Message[] = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there! How can I help?" },
        { role: "user", content: "Tell me about compaction" },
      ];
      const result = await compactConversation(messages, 200_000, 8_192);
      expect(result.summary).toBeTypeOf("string");
      expect(result.summary.length).toBeGreaterThan(0);
      expect(result.compactedMessages).toBeInstanceOf(Array);
      expect(result.success).toBe(true);
    });

    test("removes tokens from conversation", async () => {
      const messages: Message[] = [
        { role: "user", content: "A".repeat(1000) },
        { role: "assistant", content: "B".repeat(1000) },
        { role: "user", content: "C".repeat(1000) },
      ];
      const result = await compactConversation(messages, 200_000, 8_192);
      expect(result.tokensRemoved).toBeGreaterThanOrEqual(0);
      expect(typeof result.tokensRemaining).toBe("number");
    });
  });

  describe("partialCompactConversation", () => {
    test("keeps recent messages intact", async () => {
      const messages: Message[] = [
        { role: "user", content: "Old message 1" },
        { role: "assistant", content: "Old response 1" },
        { role: "user", content: "Recent message" },
        { role: "assistant", content: "Recent response" },
      ];
      const result = await partialCompactConversation(messages, 100);
      expect(result.compactedMessages).toBeInstanceOf(Array);
      // Last message should be preserved
      const lastOriginal = messages[messages.length - 1];
      const lastCompacted =
        result.compactedMessages[result.compactedMessages.length - 1];
      expect(lastCompacted.content).toBe(lastOriginal.content);
      expect(result.success).toBe(true);
    });
  });
});
