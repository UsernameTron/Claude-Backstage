import { describe, test, expect } from "bun:test";
import {
  roughTokenCountEstimation,
  roughTokenCountEstimationForMessages,
  bytesPerTokenForFileType,
  countTokensWithAPI,
  tokenCountWithEstimation,
  type Message,
} from "./index";

describe("token-estimation", () => {
  describe("roughTokenCountEstimation", () => {
    test("returns Math.ceil(text.length / 4) for simple text", () => {
      expect(roughTokenCountEstimation("hello world")).toBe(
        Math.ceil(11 / 4),
      );
    });

    test("returns 0 for empty string", () => {
      expect(roughTokenCountEstimation("")).toBe(0);
    });

    test("returns 1 for single character", () => {
      expect(roughTokenCountEstimation("a")).toBe(1);
    });

    test("handles exactly divisible length", () => {
      expect(roughTokenCountEstimation("abcd")).toBe(1);
    });

    test("handles long text", () => {
      const text = "x".repeat(1000);
      expect(roughTokenCountEstimation(text)).toBe(250);
    });
  });

  describe("roughTokenCountEstimationForMessages", () => {
    test("counts tokens across message contents", () => {
      const messages: Message[] = [
        { role: "user", content: "test" },
      ];
      const result = roughTokenCountEstimationForMessages(messages);
      // "test" = 4 chars -> 1 token + ~4 overhead per message
      expect(result).toBeGreaterThan(0);
    });

    test("returns 0 for empty array", () => {
      expect(roughTokenCountEstimationForMessages([])).toBe(0);
    });

    test("sums multiple messages", () => {
      const messages: Message[] = [
        { role: "user", content: "hello" },
        { role: "assistant", content: "world" },
      ];
      const result = roughTokenCountEstimationForMessages(messages);
      // Each message: ceil(5/4)=2 tokens content + 4 overhead = 6 per message
      expect(result).toBe(12);
    });
  });

  describe("bytesPerTokenForFileType", () => {
    test("returns a number for .ts files", () => {
      const result = bytesPerTokenForFileType(".ts");
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe("number");
    });

    test("returns a number for .py files", () => {
      expect(bytesPerTokenForFileType(".py")).toBeGreaterThan(0);
    });

    test("returns default for unknown extension", () => {
      expect(bytesPerTokenForFileType(".xyz")).toBe(4.0);
    });

    test("returns known value for .json", () => {
      expect(bytesPerTokenForFileType(".json")).toBe(4.0);
    });

    test("returns known value for .md", () => {
      expect(bytesPerTokenForFileType(".md")).toBe(4.5);
    });
  });

  describe("countTokensWithAPI", () => {
    test("returns estimate for messages", () => {
      const messages: Message[] = [
        { role: "user", content: "hello world" },
      ];
      const result = countTokensWithAPI(messages);
      expect(result).toBeGreaterThan(0);
    });

    test("returns 0 for empty messages", () => {
      expect(countTokensWithAPI([])).toBe(0);
    });
  });

  describe("tokenCountWithEstimation", () => {
    test("delegates to rough estimation", () => {
      const messages: Message[] = [
        { role: "user", content: "test" },
      ];
      const result = tokenCountWithEstimation(messages);
      expect(result).toBe(roughTokenCountEstimationForMessages(messages));
    });

    test("returns 0 for empty messages", () => {
      expect(tokenCountWithEstimation([])).toBe(0);
    });
  });
});
