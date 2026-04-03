/**
 * @claude-patterns/skills-system
 *
 * Skill loading, registration, frontmatter parsing, and token estimation.
 * Source: skills/ (20 files, 4,066 LOC)
 * KB: Pattern 12 — Skills System
 * Tier: Build P1
 */

import type { MemoryFile } from "@claude-patterns/claudemd-memory";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

// Bundled skill definition for programmatic registration
export interface BundledSkillDefinition {
  name: string;
  description: string;
  instructions: string;
  tools?: string[];
  model?: "sonnet" | "opus" | "haiku" | "inherit";
}

// Parsed SKILL.md frontmatter
export interface SkillFrontmatter {
  name: string;
  description: string;
  allowedTools?: string[];
  disableModelInvocation?: boolean;
  userInvocable?: boolean;
  contextFork?: boolean;
}

// Skill command exposed for slash-command registration
export interface SkillCommand {
  name: string;
  description: string;
  skillPath: string;
  source: "bundled" | "project" | "user";
}

// Result of loading a skill with its associated memory files
export interface SkillLoadResult {
  skill: BundledSkillDefinition;
  memoryFiles: MemoryFile[];
  tokenEstimate: number;
}

// Internal registry for bundled skills
const bundledSkillRegistry = new Map<string, BundledSkillDefinition>();

// Discover skill commands from a skill directory
export async function getSkillDirCommands(
  skillDir: string,
): Promise<SkillCommand[]> {
  const commands: SkillCommand[] = [];
  let entries: string[];
  try {
    entries = await readdir(skillDir);
  } catch {
    return commands;
  }

  for (const entry of entries) {
    const skillPath = join(skillDir, entry, "SKILL.md");
    try {
      const content = await readFile(skillPath, "utf-8");
      const frontmatter = parseFrontmatter(content);
      if (frontmatter) {
        commands.push({
          name: frontmatter.name,
          description: frontmatter.description,
          skillPath,
          source: skillDir.includes(".claude/skills") ? "project" : "user",
        });
      }
    } catch {
      // Skip directories without SKILL.md
    }
  }

  return commands;
}

// Register a bundled skill definition
export function registerBundledSkill(
  definition: BundledSkillDefinition,
): void {
  bundledSkillRegistry.set(definition.name, definition);
}

// Estimate token cost of skill frontmatter for context budget
// Rough heuristic: ~4 chars per token for English text
export function estimateSkillFrontmatterTokens(
  frontmatter: SkillFrontmatter,
): number {
  const parts: string[] = [
    frontmatter.name,
    frontmatter.description,
  ];
  if (frontmatter.allowedTools) {
    parts.push(frontmatter.allowedTools.join(", "));
  }
  const totalChars = parts.reduce((sum, p) => sum + p.length, 0);
  return Math.max(1, Math.ceil(totalChars / 4));
}

// Load a skill from disk, resolving its memory files
export async function loadSkill(
  skillPath: string,
): Promise<SkillLoadResult> {
  const content = await readFile(skillPath, "utf-8");
  const frontmatter = parseFrontmatter(content);
  if (!frontmatter) {
    throw new Error(`No valid frontmatter found in ${skillPath}`);
  }

  // Extract body after frontmatter
  const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  const body = bodyMatch ? bodyMatch[1].trim() : "";

  // Check for MEMORY.md in the same directory
  const skillDir = skillPath.replace(/\/SKILL\.md$/, "");
  const memoryFiles: MemoryFile[] = [];
  try {
    const memoryContent = await readFile(join(skillDir, "MEMORY.md"), "utf-8");
    memoryFiles.push({
      path: join(skillDir, "MEMORY.md"),
      tier: "project" as const,
      content: memoryContent,
    });
  } catch {
    // No memory file
  }

  return {
    skill: {
      name: frontmatter.name,
      description: frontmatter.description,
      instructions: body,
      tools: frontmatter.allowedTools,
    },
    memoryFiles,
    tokenEstimate: estimateSkillFrontmatterTokens(frontmatter),
  };
}

// Parse SKILL.md frontmatter from raw content
// Expects YAML between --- delimiters at the start of file
export function parseFrontmatter(
  content: string,
): SkillFrontmatter | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const lines = yaml.split("\n");
  const result: Record<string, string> = {};

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = value;
  }

  if (!result.name || !result.description) return null;

  const frontmatter: SkillFrontmatter = {
    name: result.name,
    description: result.description,
  };

  if (result["allowed-tools"]) {
    frontmatter.allowedTools = result["allowed-tools"]
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  if (result["disable-model-invocation"] !== undefined) {
    frontmatter.disableModelInvocation =
      result["disable-model-invocation"] === "true";
  }

  if (result["user-invocable"] !== undefined) {
    frontmatter.userInvocable = result["user-invocable"] === "true";
  }

  if (result["context-fork"] !== undefined) {
    frontmatter.contextFork = result["context-fork"] === "true";
  }

  return frontmatter;
}
