/**
 * @claude-patterns/skills-system
 *
 * Skill loading, registration, frontmatter parsing, and token estimation.
 * Source: skills/ (20 files, 4,066 LOC)
 * KB: Pattern 12 — Skills System
 * Tier: Build P1
 */

import type { MemoryFile } from "@claude-patterns/claudemd-memory";

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

// Discover skill commands from a skill directory
export function getSkillDirCommands(
  skillDir: string,
): Promise<SkillCommand[]> {
  // TODO: extract from skills/
  throw new Error("TODO: extract from skills/");
}

// Register a bundled skill definition
export function registerBundledSkill(
  definition: BundledSkillDefinition,
): void {
  // TODO: extract from skills/
  throw new Error("TODO: extract from skills/");
}

// Estimate token cost of skill frontmatter for context budget
export function estimateSkillFrontmatterTokens(
  frontmatter: SkillFrontmatter,
): number {
  // TODO: extract from skills/
  throw new Error("TODO: extract from skills/");
}

// Load a skill from disk, resolving its memory files
export function loadSkill(
  skillPath: string,
): Promise<SkillLoadResult> {
  // TODO: extract from skills/
  throw new Error("TODO: extract from skills/");
}

// Parse SKILL.md frontmatter from raw content
export function parseFrontmatter(
  content: string,
): SkillFrontmatter | null {
  // TODO: extract from skills/
  throw new Error("TODO: extract from skills/");
}
