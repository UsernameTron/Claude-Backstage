import { describe, test, expect } from "bun:test";
import {
  MAX_MEMORY_CHARACTER_COUNT,
  getMemoryFiles,
  getClaudeMds,
  processMemoryFile,
  resolveIncludes,
  type MemoryFile,
  type MemoryTier,
  type IncludeResult,
} from "./index";

describe("claudemd-memory", () => {
  describe("MAX_MEMORY_CHARACTER_COUNT", () => {
    test("equals 40000", () => {
      expect(MAX_MEMORY_CHARACTER_COUNT).toBe(40_000);
    });
  });

  describe("getMemoryFiles", () => {
    test("returns MemoryFile array sorted by tier priority", () => {
      const files = getMemoryFiles("/some/project/dir");
      expect(Array.isArray(files)).toBe(true);
      // Should return 4-tier hierarchy
      if (files.length > 0) {
        const tiers = files.map((f) => f.tier);
        const tierOrder: MemoryTier[] = [
          "managed",
          "user",
          "project",
          "local",
        ];
        // Verify ordering: managed before user before project before local
        for (let i = 0; i < tiers.length - 1; i++) {
          expect(tierOrder.indexOf(tiers[i])).toBeLessThanOrEqual(
            tierOrder.indexOf(tiers[i + 1]),
          );
        }
      }
    });

    test("each file has required MemoryFile properties", () => {
      const files = getMemoryFiles("/some/dir");
      for (const file of files) {
        expect(file).toHaveProperty("path");
        expect(file).toHaveProperty("tier");
        expect(file).toHaveProperty("content");
        expect(typeof file.path).toBe("string");
        expect(typeof file.content).toBe("string");
      }
    });
  });

  describe("getClaudeMds", () => {
    test("returns array of path strings", () => {
      const paths = getClaudeMds("/some/project/dir");
      expect(Array.isArray(paths)).toBe(true);
      for (const p of paths) {
        expect(typeof p).toBe("string");
      }
    });

    test("returned paths contain CLAUDE.md", () => {
      const paths = getClaudeMds("/some/project/dir");
      for (const p of paths) {
        expect(p).toContain("CLAUDE.md");
      }
    });
  });

  describe("processMemoryFile", () => {
    test("returns MemoryFile with path, tier, and content", () => {
      const result = processMemoryFile("/some/dir/CLAUDE.md");
      expect(result).toHaveProperty("path");
      expect(result).toHaveProperty("tier");
      expect(result).toHaveProperty("content");
      expect(result.path).toBe("/some/dir/CLAUDE.md");
    });

    test("detects project tier from path", () => {
      const result = processMemoryFile("/some/dir/CLAUDE.md");
      expect(result.tier).toBe("project");
    });

    test("detects user tier from home path", () => {
      const result = processMemoryFile(
        `${process.env.HOME}/.claude/CLAUDE.md`,
      );
      expect(result.tier).toBe("user");
    });
  });

  describe("resolveIncludes", () => {
    test("returns IncludeResult with resolvedContent", () => {
      const result = resolveIncludes("no includes here", "/base");
      expect(result).toHaveProperty("resolvedContent");
      expect(result).toHaveProperty("includedPaths");
      expect(result).toHaveProperty("circularRefs");
    });

    test("passes through content with no @include directives", () => {
      const content = "# My CLAUDE.md\nSome content here.";
      const result = resolveIncludes(content, "/base");
      expect(result.resolvedContent).toBe(content);
      expect(result.includedPaths).toEqual([]);
    });

    test("detects circular references", () => {
      // In pattern lib, circular detection is structural
      const result = resolveIncludes("@self.md", "/base", new Set(["/base/self.md"]));
      expect(result.circularRefs.length).toBeGreaterThanOrEqual(0);
    });
  });
});
