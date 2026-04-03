import { describe, expect, test } from "bun:test";
import {
  parseFrontmatter,
  loadSkill,
  registerBundledSkill,
  getSkillDirCommands,
  estimateSkillFrontmatterTokens,
} from "./index";
import type {
  SkillFrontmatter,
  BundledSkillDefinition,
  SkillCommand,
  SkillLoadResult,
} from "./index";

describe("skills-system", () => {
  describe("parseFrontmatter", () => {
    test("extracts name and description from ---\\nname: test\\n--- format", () => {
      const content = `---
name: test-skill
description: A test skill for testing
---

# Test Skill

Instructions here.`;
      const result = parseFrontmatter(content);
      expect(result).not.toBeNull();
      expect(result!.name).toBe("test-skill");
      expect(result!.description).toBe("A test skill for testing");
    });

    test("returns null for content without frontmatter", () => {
      const content = "# Just a heading\n\nNo frontmatter here.";
      const result = parseFrontmatter(content);
      expect(result).toBeNull();
    });

    test("parses allowed-tools as array", () => {
      const content = `---
name: analyzer
description: Code analyzer
allowed-tools: Read, Grep, Glob
---

Body content.`;
      const result = parseFrontmatter(content);
      expect(result).not.toBeNull();
      expect(result!.allowedTools).toEqual(["Read", "Grep", "Glob"]);
    });

    test("parses boolean fields", () => {
      const content = `---
name: fork-skill
description: Forks context
context-fork: true
user-invocable: false
---

Body.`;
      const result = parseFrontmatter(content);
      expect(result).not.toBeNull();
      expect(result!.contextFork).toBe(true);
      expect(result!.userInvocable).toBe(false);
    });
  });

  describe("loadSkill", () => {
    test("returns SkillLoadResult with frontmatter and body", async () => {
      const { writeFileSync, mkdirSync, rmSync } = await import("fs");
      const tmpDir = "/tmp/test-skill-" + Date.now();
      mkdirSync(tmpDir, { recursive: true });
      writeFileSync(
        tmpDir + "/SKILL.md",
        "---\nname: test-load\ndescription: A test skill\n---\n\nDo something useful.",
      );
      try {
        const result = await loadSkill(tmpDir + "/SKILL.md");
        expect(result).toBeDefined();
        expect(result.skill).toBeDefined();
        expect(result.skill.name).toBe("test-load");
        expect(result.skill.description).toBe("A test skill");
        expect(result.memoryFiles).toBeInstanceOf(Array);
        expect(typeof result.tokenEstimate).toBe("number");
      } finally {
        rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("registerBundledSkill", () => {
    test("stores and retrieves skill without error", () => {
      const definition: BundledSkillDefinition = {
        name: "test-bundled",
        description: "A bundled skill",
        instructions: "Do the thing",
        tools: ["Read", "Write"],
      };
      // Should not throw
      expect(() => registerBundledSkill(definition)).not.toThrow();
    });
  });

  describe("getSkillDirCommands", () => {
    test("returns SkillCommand array", async () => {
      const commands = await getSkillDirCommands("/fake/skills/dir");
      expect(commands).toBeInstanceOf(Array);
      for (const cmd of commands) {
        expect(cmd.name).toBeTypeOf("string");
        expect(cmd.description).toBeTypeOf("string");
        expect(cmd.skillPath).toBeTypeOf("string");
        expect(["bundled", "project", "user"]).toContain(cmd.source);
      }
    });
  });

  describe("estimateSkillFrontmatterTokens", () => {
    test("returns positive number for non-empty frontmatter", () => {
      const frontmatter: SkillFrontmatter = {
        name: "test-skill",
        description: "A test skill for demonstration purposes",
      };
      const tokens = estimateSkillFrontmatterTokens(frontmatter);
      expect(tokens).toBeGreaterThan(0);
      expect(typeof tokens).toBe("number");
    });

    test("returns smaller number for shorter frontmatter", () => {
      const short: SkillFrontmatter = {
        name: "a",
        description: "b",
      };
      const long: SkillFrontmatter = {
        name: "very-long-skill-name-here",
        description:
          "A very long description that goes on and on about what this skill does",
        allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
      };
      expect(estimateSkillFrontmatterTokens(short)).toBeLessThan(
        estimateSkillFrontmatterTokens(long),
      );
    });
  });
});
