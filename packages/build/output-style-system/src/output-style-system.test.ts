import { describe, test, expect } from "bun:test";
import {
  loadOutputStyles,
  applyOutputStyle,
  isPlainText,
  createMarkdownCache,
  type OutputStyle,
} from "./index";

describe("output-style-system", () => {
  describe("loadOutputStyles", () => {
    test("returns simulated style array with default and concise", () => {
      const styles = loadOutputStyles({
        userStyleDir: "/tmp/user",
        projectStyleDir: "/tmp/project",
      });
      expect(styles.length).toBeGreaterThanOrEqual(2);
      const names = styles.map((s) => s.name);
      expect(names).toContain("default");
      expect(names).toContain("concise");
    });

    test("default style has keepCodingInstructions true", () => {
      const styles = loadOutputStyles({
        userStyleDir: "/tmp/user",
        projectStyleDir: "/tmp/project",
      });
      const defaultStyle = styles.find((s) => s.name === "default");
      expect(defaultStyle?.keepCodingInstructions).toBe(true);
      expect(defaultStyle?.forceForPlugin).toBe(false);
    });
  });

  describe("applyOutputStyle", () => {
    const baseStyle: OutputStyle = {
      name: "test",
      description: "test style",
      keepCodingInstructions: true,
      forceForPlugin: false,
      content: "Be concise.",
    };

    test("appends style content as suffix", () => {
      const result = applyOutputStyle("Hello world", baseStyle);
      expect(result).toContain("Be concise.");
    });

    test("preserves code blocks when keepCodingInstructions is true", () => {
      const content = "Text\n```js\nconsole.log('hi');\n```\nMore text";
      const result = applyOutputStyle(content, {
        ...baseStyle,
        keepCodingInstructions: true,
      });
      expect(result).toContain("```js\nconsole.log('hi');\n```");
    });

    test("wraps in plugin markers when forceForPlugin is true", () => {
      const result = applyOutputStyle("content", {
        ...baseStyle,
        forceForPlugin: true,
      });
      expect(result).toContain("<plugin-style>");
      expect(result).toContain("</plugin-style>");
    });
  });

  describe("isPlainText", () => {
    test("returns true for plain text", () => {
      expect(isPlainText("hello world")).toBe(true);
    });

    test("returns false for markdown heading", () => {
      expect(isPlainText("# heading\n**bold**")).toBe(false);
    });

    test("returns false for bold markdown", () => {
      expect(isPlainText("some **bold** text")).toBe(false);
    });

    test("uses custom sampleSize", () => {
      // First 5 chars of "plain# heading" is "plain" — no markdown
      expect(isPlainText("plain# heading", 5)).toBe(true);
    });

    test("returns true for empty string", () => {
      expect(isPlainText("")).toBe(true);
    });
  });

  describe("createMarkdownCache", () => {
    test("returns cache with get/set/has/clear/size", () => {
      const cache = createMarkdownCache();
      expect(typeof cache.get).toBe("function");
      expect(typeof cache.set).toBe("function");
      expect(typeof cache.has).toBe("function");
      expect(typeof cache.clear).toBe("function");
      expect(typeof cache.size).toBe("function");
    });

    test("stores and retrieves values", () => {
      const cache = createMarkdownCache();
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
      expect(cache.has("key1")).toBe(true);
      expect(cache.size()).toBe(1);
    });

    test("evicts oldest entry when maxEntries exceeded (LRU)", () => {
      const cache = createMarkdownCache({ maxEntries: 2, sampleSize: 500 });
      cache.set("a", "1");
      cache.set("b", "2");
      cache.set("c", "3"); // should evict "a"
      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
      expect(cache.size()).toBe(2);
    });

    test("LRU refresh on get moves entry to end", () => {
      const cache = createMarkdownCache({ maxEntries: 2, sampleSize: 500 });
      cache.set("a", "1");
      cache.set("b", "2");
      cache.get("a"); // refresh "a", now "b" is oldest
      cache.set("c", "3"); // should evict "b" (oldest)
      expect(cache.has("a")).toBe(true);
      expect(cache.has("b")).toBe(false);
      expect(cache.has("c")).toBe(true);
    });

    test("clear removes all entries", () => {
      const cache = createMarkdownCache();
      cache.set("k1", "v1");
      cache.set("k2", "v2");
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });
});
